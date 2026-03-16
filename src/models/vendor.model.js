import mongoose from "mongoose";
import { VENDOR_STATUS } from "../constants/index.js";

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    storeName: {
      type:      String,
      required:  [true, "Store name is required"],
      trim:      true,
      unique:    true,
      minlength: [3, "Store name must be at least 3 characters"],
      maxlength: [50, "Store name cannot exceed 50 characters"],
    },
    storeDescription: {
      type:      String,
      trim:      true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default:   "",
    },
    storeLogo: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    storeBanner: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    status: {
      type:    String,
      enum:    Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.PENDING,
    },
    totalEarnings: {
      type:    Number,
      default: 0,
    },
    totalOrders: {
      type:    Number,
      default: 0,
    },
    totalProducts: {
      type:    Number,
      default: 0,
    },
    bankDetails: {
      accountName:   { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      bankName:      { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
vendorSchema.index({ user: 1 });               // lookup vendor by user
vendorSchema.index({ status: 1 });             // filter by approval status
vendorSchema.index({ storeName: "text" });     // text search on store name
vendorSchema.index({ totalEarnings: -1 });     // sort top earning vendors

export const Vendor = mongoose.model("Vendor", vendorSchema);