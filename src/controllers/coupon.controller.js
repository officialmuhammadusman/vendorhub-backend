import { Coupon } from "../models/coupon.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── CREATE COUPON (admin/vendor) ────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, discountType, discountValue,
    minOrderAmount, maxDiscount, usageLimit, expiresAt,
  } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) throw new ApiError(409, "Coupon code already exists");

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    expiresAt,
  });

  return res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

// ─── GET ALL COUPONS (admin) ──────────────────────────────────────
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched"));
});

// ─── TOGGLE COUPON STATUS (admin) ────────────────────────────────
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return res.status(200).json(
    new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`)
  );
});

// ─── DELETE COUPON (admin) ────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return res.status(200).json(new ApiResponse(200, {}, "Coupon deleted"));
});

// ─── VALIDATE COUPON (public check) ──────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon || new Date() > coupon.expiresAt) {
    throw new ApiError(404, "Invalid or expired coupon");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      code:          coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      expiresAt:     coupon.expiresAt,
    }, "Coupon is valid")
  );
});