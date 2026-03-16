import { Router } from "express";
import {
  createCoupon, getAllCoupons,
  toggleCoupon, deleteCoupon, validateCoupon,
} from "../controllers/coupon.controller.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /coupons/validate/{code}:
 *   get:
 *     summary: Check if coupon code is valid (public)
 *     tags: [Coupons]
 *     description: Test with SAVE20 or FLAT10 after creating them as admin.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         example: SAVE20
 *     responses:
 *       200:
 *         description: Coupon is valid
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 code: "SAVE20"
 *                 discountType: "percentage"
 *                 discountValue: 20
 *                 minOrderAmount: 50
 *                 expiresAt: "2025-12-31T23:59:59.000Z"
 *       404:
 *         description: Invalid or expired coupon
 */
router.get("/validate/:code", validateCoupon);

router.use(verifyJWT, verifyRole("admin"));

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All coupons
 */
router.get("/", getAllCoupons);

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       **Create percentage coupon (SAVE20):**
 *       20% off, min $50 order, max $30 discount, 100 uses
 *
 *       **Create fixed coupon (FLAT10):**
 *       $10 flat off, min $30 order, 50 uses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCoupon'
 *           examples:
 *             percentage:
 *               summary: Percentage Coupon — SAVE20
 *               value:
 *                 code: "SAVE20"
 *                 discountType: "percentage"
 *                 discountValue: 20
 *                 minOrderAmount: 50
 *                 maxDiscount: 30
 *                 usageLimit: 100
 *                 expiresAt: "2025-12-31T23:59:59.000Z"
 *             fixed:
 *               summary: Fixed Coupon — FLAT10
 *               value:
 *                 code: "FLAT10"
 *                 discountType: "fixed"
 *                 discountValue: 10
 *                 minOrderAmount: 30
 *                 usageLimit: 50
 *                 expiresAt: "2025-12-31T23:59:59.000Z"
 *     responses:
 *       201:
 *         description: Coupon created
 *       409:
 *         description: Code already exists
 */
router.post("/", createCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   patch:
 *     summary: Toggle coupon on/off (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon activated or deactivated
 */
router.patch("/:id", toggleCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
router.delete("/:id", deleteCoupon);

export default router;