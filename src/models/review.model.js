import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
    },
    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating cannot exceed 5"],
    },
    comment: {
      type:      String,
      required:  [true, "Review comment is required"],
      trim:      true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isVerifiedPurchase: {
      type:    Boolean,
      default: true, // always true since we check order
    },
    images: [
      {
        url:      { type: String },
        publicId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // one review per product per user
reviewSchema.index({ rating: -1 });

// ─── Update product rating after save ────────────────────────────
reviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: this.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count":   stats[0].count,
    });
  }
});

// ─── Update product rating after delete ──────────────────────────
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: doc.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(doc.product, {
    "ratings.average": stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    "ratings.count":   stats.length > 0 ? stats[0].count : 0,
  });
});

export const Review = mongoose.model("Review", reviewSchema);