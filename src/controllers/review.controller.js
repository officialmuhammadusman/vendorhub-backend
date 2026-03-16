import { Review }  from "../models/review.model.js";
import { Order }   from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/fileUpload.js";

// ─── CREATE REVIEW ────────────────────────────────────────────────
export const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Verify the user actually purchased this product in this order
  const order = await Order.findOne({
    _id:            orderId,
    user:           req.user._id,
    "items.product": productId,
    status:         "delivered",
    paymentStatus:  "paid",
  });

  if (!order) {
    throw new ApiError(403, "You can only review products you have purchased and received");
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user:    req.user._id,
    product: productId,
  });
  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  // Upload review images if provided
  let images = [];
  if (req.files && req.files.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path, "vendorhub/reviews"))
    );
    images = uploaded.map((img) => ({ url: img.secure_url, publicId: img.public_id }));
  }

  const review = await Review.create({
    user:    req.user._id,
    product: productId,
    order:   orderId,
    rating,
    comment,
    images,
    isVerifiedPurchase: true,
  });

  await review.populate("user", "fullName avatar");

  return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

// ─── GET REVIEWS FOR A PRODUCT ────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating } = req.query;
  const query = { product: req.params.productId };
  if (rating) query.rating = Number(rating);

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(query),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require("mongoose").Types.ObjectId(req.params.productId) } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      distribution,
      pagination: {
        total,
        page:       Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Reviews fetched")
  );
});

// ─── UPDATE REVIEW ────────────────────────────────────────────────
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, "Review not found");

  if (rating)  review.rating  = rating;
  if (comment) review.comment = comment;
  await review.save();

  return res.status(200).json(new ApiResponse(200, review, "Review updated"));
});

// ─── DELETE REVIEW ────────────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id:  req.params.id,
    user: req.user._id,
  });
  if (!review) throw new ApiError(404, "Review not found");

  // Delete review images from Cloudinary
  if (review.images.length > 0) {
    await Promise.all(review.images.map((img) => deleteFromCloudinary(img.publicId)));
  }

  await review.findOneAndDelete();

  return res.status(200).json(new ApiResponse(200, {}, "Review deleted"));
});

// ─── GET MY REVIEWS ───────────────────────────────────────────────
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "title images")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, reviews, "Your reviews fetched"));
});