import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type:      String,
      required:  [true, "Coupon code is required"],
      unique:    true,
      uppercase: true,
      trim:      true,
    },
    discountType: {
      type:     String,
      enum:     ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type:     Number,
      required: true,
      min:      [0, "Discount value cannot be negative"],
    },
    minOrderAmount: {
      type:    Number,
      default: 0,
    },
    maxDiscount: {
      type:    Number,
      default: null, // null means no cap
    },
    usageLimit: {
      type:    Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type:    Number,
      default: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "User",
      },
    ],
    isActive: {
      type:    Boolean,
      default: true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    vendor: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Vendor",
      default: null, // null means platform-wide coupon
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
couponSchema.index({ code: 1 });
couponSchema.index({ expiresAt: 1 });
couponSchema.index({ isActive: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);