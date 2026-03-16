import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Vendor",
      required: true,
    },
    title: {
      type:      String,
      required:  [true, "Product title is required"],
      trim:      true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type:      String,
      required:  [true, "Product description is required"],
      trim:      true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    discountPrice: {
      type:    Number,
      default: 0,
      min:     [0, "Discount price cannot be negative"],
    },
    category: {
      type:     String,
      required: [true, "Category is required"],
      trim:     true,
      lowercase: true,
    },
    images: [
      {
        url:      { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    stock: {
      type:    Number,
      default: 0,
      min:     [0, "Stock cannot be negative"],
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    sold: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
productSchema.index({ vendor: 1 });                        // vendor's products
productSchema.index({ category: 1 });                      // filter by category
productSchema.index({ price: 1 });                         // sort by price
productSchema.index({ "ratings.average": -1 });            // top rated
productSchema.index({ createdAt: -1 });                    // newest products
productSchema.index({ vendor: 1, category: 1 });           // compound: vendor + category
productSchema.index({ title: "text", description: "text", tags: "text" }); // full text search

export const Product = mongoose.model("Product", productSchema);