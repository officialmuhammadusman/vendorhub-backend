import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Product",
    required: true,
  },
  vendor: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Vendor",
    required: true,
  },
  quantity: {
    type:    Number,
    required: true,
    min:     [1, "Quantity must be at least 1"],
    default: 1,
  },
  price: {
    type:     Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    items: [cartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Coupon",
      default: null,
    },
    discount: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ─── Virtual: calculate total ─────────────────────────────────────
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.virtual("total").get(function () {
  return this.subtotal - this.discount;
});

cartSchema.set("toJSON",   { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────
cartSchema.index({ user: 1 });

export const Cart = mongoose.model("Cart", cartSchema);