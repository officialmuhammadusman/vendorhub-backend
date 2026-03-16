import { Vendor }  from "../models/vendor.model.js";
import { User }    from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order }   from "../models/order.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/fileUpload.js";
import { groupEarningsByMonth } from "../utils/calculateEarnings.js";
import { VENDOR_STATUS, USER_ROLES } from "../constants/index.js";

// ─── SETUP VENDOR PROFILE ─────────────────────────────────────────
export const setupVendorProfile = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, bankDetails } = req.body;

  // Check if vendor profile already exists
  const existing = await Vendor.findOne({ user: req.user._id });
  if (existing) {
    throw new ApiError(409, "Vendor profile already exists");
  }

  // Check store name uniqueness
  const storeNameTaken = await Vendor.findOne({ storeName });
  if (storeNameTaken) {
    throw new ApiError(409, "Store name is already taken");
  }

  // Handle logo and banner uploads
  let storeLogo   = { url: "", publicId: "" };
  let storeBanner = { url: "", publicId: "" };

  if (req.files?.storeLogo?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.storeLogo[0].path, "vendorhub/logos");
    storeLogo = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }
  if (req.files?.storeBanner?.[0]) {
    const uploaded = await uploadToCloudinary(req.files.storeBanner[0].path, "vendorhub/banners");
    storeBanner = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  const vendor = await Vendor.create({
    user: req.user._id,
    storeName,
    storeDescription,
    storeLogo,
    storeBanner,
    bankDetails,
  });

  // Update user role to vendor
  await User.findByIdAndUpdate(req.user._id, { role: USER_ROLES.VENDOR });

  return res
    .status(201)
    .json(new ApiResponse(201, vendor, "Vendor profile created. Awaiting approval."));
});

// ─── GET MY VENDOR PROFILE ────────────────────────────────────────
export const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id }).populate(
    "user", "fullName email avatar"
  );

  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor profile fetched"));
});

// ─── UPDATE VENDOR PROFILE ────────────────────────────────────────
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, bankDetails } = req.body;
  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  // Check store name uniqueness if being changed
  if (storeName && storeName !== vendor.storeName) {
    const taken = await Vendor.findOne({ storeName });
    if (taken) throw new ApiError(409, "Store name is already taken");
  }

  const updateData = {};
  if (storeName)        updateData.storeName        = storeName;
  if (storeDescription) updateData.storeDescription = storeDescription;
  if (bankDetails)      updateData.bankDetails       = bankDetails;

  if (req.files?.storeLogo?.[0]) {
    if (vendor.storeLogo.publicId) {
      await deleteFromCloudinary(vendor.storeLogo.publicId);
    }
    const uploaded = await uploadToCloudinary(req.files.storeLogo[0].path, "vendorhub/logos");
    updateData.storeLogo = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  if (req.files?.storeBanner?.[0]) {
    if (vendor.storeBanner.publicId) {
      await deleteFromCloudinary(vendor.storeBanner.publicId);
    }
    const uploaded = await uploadToCloudinary(req.files.storeBanner[0].path, "vendorhub/banners");
    updateData.storeBanner = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  const updated = await Vendor.findOneAndUpdate(
    { user: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Vendor profile updated"));
});

// ─── GET VENDOR DASHBOARD STATS ───────────────────────────────────
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const [totalProducts, lowStockProducts, recentOrders] = await Promise.all([
    Product.countDocuments({ vendor: vendor._id, isActive: true }),
    Product.countDocuments({ vendor: vendor._id, stock: { $lte: 5 }, isActive: true }),
    Order.find({ "items.vendor": vendor._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "fullName email"),
  ]);

  const dashboardData = {
    storeName:     vendor.storeName,
    status:        vendor.status,
    totalEarnings: vendor.totalEarnings,
    totalOrders:   vendor.totalOrders,
    totalProducts,
    lowStockProducts,
    recentOrders,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, dashboardData, "Dashboard data fetched"));
});

// ─── GET VENDOR EARNINGS ANALYTICS ───────────────────────────────
export const getEarningsAnalytics = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const orders = await Order.find({
    "items.vendor": vendor._id,
    paymentStatus:  "paid",
  });

  const monthlyEarnings = groupEarningsByMonth(orders, vendor._id);

  return res.status(200).json(
    new ApiResponse(200, {
      totalEarnings:  vendor.totalEarnings,
      totalOrders:    vendor.totalOrders,
      monthlyEarnings,
    }, "Earnings analytics fetched")
  );
});

// ─── GET PUBLIC VENDOR STORE (for customers) ─────────────────────
export const getVendorStore = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId)
    .populate("user", "fullName avatar");

  if (!vendor || vendor.status !== VENDOR_STATUS.APPROVED) {
    throw new ApiError(404, "Store not found");
  }

  const products = await Product.find({ vendor: vendor._id, isActive: true })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { vendor, products }, "Vendor store fetched")
  );
});