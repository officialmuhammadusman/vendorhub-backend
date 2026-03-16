import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants/index.js";

const orderItemSchema = new mongoose.Schema({
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
  title:    { type: String,  required: true },
  image:    { type: String,  required: true },
  price:    { type: Number,  required: true },
  quantity: { type: Number,  required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName:   { type: String, required: true },
      phone:      { type: String, required: true },
      address:    { type: String, required: true },
      city:       { type: String, required: true },
      state:      { type: String, required: true },
      postalCode: { type: String, required: true },
      country:    { type: String, required: true, default: "Pakistan" },
    },
    subtotal:     { type: Number, required: true },
    discount:     { type: Number, default: 0 },
    total:        { type: Number, required: true },
    coupon:       { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type:    String,
      enum:    Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentIntentId: { type: String, default: "" },
    stripeChargeId:  { type: String, default: "" },
    paidAt:          { type: Date,   default: null },
    deliveredAt:     { type: Date,   default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
orderSchema.index({ user: 1 });
orderSchema.index({ "items.vendor": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });       // compound: user orders sorted

export const Order = mongoose.model("Order", orderSchema);