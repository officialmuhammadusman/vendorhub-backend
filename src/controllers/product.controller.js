import { Product } from "../models/product.model.js";
import { Vendor }  from "../models/vendor.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/fileUpload.js";
import { LOW_STOCK_THRESHOLD } from "../constants/index.js";

// ─── CREATE PRODUCT ───────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");
  if (vendor.status !== "approved") {
    throw new ApiError(403, "Your store must be approved before adding products");
  }

  const { title, description, price, discountPrice, category, stock, tags } = req.body;

  // Upload product images
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const images = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.path, "vendorhub/products"))
  );

  const product = await Product.create({
    vendor:       vendor._id,
    title,
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    stock:         stock || 0,
    tags:          tags ? tags.split(",").map((t) => t.trim()) : [],
    images:        images.map((img) => ({ url: img.secure_url, publicId: img.public_id })),
  });

  // Update vendor product count
  await Vendor.findByIdAndUpdate(vendor._id, { $inc: { totalProducts: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// ─── GET ALL PRODUCTS (public with filters) ───────────────────────
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search, category, minPrice, maxPrice,
    sort = "createdAt", order = "desc",
    page = 1, limit = 12,
  } = req.query;

  const query = { isActive: true };

  // Full text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) query.category = category.toLowerCase();

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortObj = { [sort]: order === "desc" ? -1 : 1 };
  const skip    = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("vendor", "storeName storeLogo")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Products fetched")
  );
});

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor", "storeName storeLogo storeDescription user");

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched"));
});

// ─── UPDATE PRODUCT (vendor only) ────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const vendor  = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) throw new ApiError(404, "Product not found");
  if (product.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, "You can only update your own products");
  }

  const { title, description, price, discountPrice, category, stock, tags, isActive } = req.body;

  const updateData = {};
  if (title)        updateData.title        = title;
  if (description)  updateData.description  = description;
  if (price)        updateData.price        = price;
  if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
  if (category)     updateData.category     = category;
  if (stock !== undefined) updateData.stock = stock;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (tags)         updateData.tags         = tags.split(",").map((t) => t.trim());

  // Add new images if provided
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, "vendorhub/products"))
    );
    updateData.$push = {
      images: {
        $each: newImages.map((img) => ({ url: img.secure_url, publicId: img.public_id })),
      },
    };
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Product updated successfully"));
});

// ─── DELETE PRODUCT (vendor only) ────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const vendor  = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) throw new ApiError(404, "Product not found");
  if (product.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, "You can only delete your own products");
  }

  // Delete all images from Cloudinary
  await Promise.all(
    product.images.map((img) => deleteFromCloudinary(img.publicId))
  );

  await product.deleteOne();

  // Update vendor product count
  await Vendor.findByIdAndUpdate(vendor._id, { $inc: { totalProducts: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

// ─── DELETE SINGLE PRODUCT IMAGE ─────────────────────────────────
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, publicId } = req.params;
  const vendor  = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findById(productId);

  if (!product) throw new ApiError(404, "Product not found");
  if (product.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }
  if (product.images.length <= 1) {
    throw new ApiError(400, "Product must have at least one image");
  }

  await deleteFromCloudinary(publicId);

  await Product.findByIdAndUpdate(productId, {
    $pull: { images: { publicId } },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image deleted successfully"));
});

// ─── GET MY PRODUCTS (vendor) ─────────────────────────────────────
export const getMyProducts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { page = 1, limit = 10, search, category } = req.query;

  const query = { vendor: vendor._id };
  if (search)   query.$text    = { $search: search };
  if (category) query.category = category.toLowerCase();

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  // Flag low stock items
  const productsWithStockFlag = products.map((p) => ({
    ...p.toObject(),
    isLowStock: p.stock <= LOW_STOCK_THRESHOLD,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      products: productsWithStockFlag,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Your products fetched")
  );
});

// ─── UPDATE STOCK ONLY ────────────────────────────────────────────
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const vendor  = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) throw new ApiError(404, "Product not found");
  if (product.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }
  if (stock < 0) throw new ApiError(400, "Stock cannot be negative");

  product.stock = stock;
  await product.save();

  const isLowStock = stock <= LOW_STOCK_THRESHOLD;

  return res.status(200).json(
    new ApiResponse(200, {
      product,
      isLowStock,
      message: isLowStock ? `⚠️ Low stock alert! Only ${stock} items left.` : "Stock updated",
    }, "Stock updated successfully")
  );
});