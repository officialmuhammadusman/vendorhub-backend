import { Router }  from "express";
import express     from "express";
import {
  createPaymentIntent, placeOrder, getMyOrders,
  getOrderById, cancelOrder, updateOrderStatus,
  stripeWebhook, getVendorOrders,
} from "../controllers/order.controller.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /orders/webhook:
 *   post:
 *     summary: Stripe webhook — do NOT call manually
 *     tags: [Orders]
 */
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.use(verifyJWT);

/**
 * @swagger
 * /orders/payment-intent:
 *   post:
 *     summary: Create Stripe payment intent from cart
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.post("/payment-intent", createPaymentIntent);

/**
 * @swagger
 * /orders/place:
 *   post:
 *     summary: Place order after Stripe payment succeeds
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.post("/place", placeOrder);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get customer's own orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.get("/my-orders", getMyOrders);

/**
 * @swagger
 * /orders/vendor-orders:
 *   get:
 *     summary: Get all orders containing vendor's products
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 */
router.get("/vendor-orders", verifyRole("vendor", "admin"), getVendorOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get single order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order and refund
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.patch("/:id/cancel", cancelOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (vendor/admin)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 */
router.patch("/:id/status", verifyRole("vendor", "admin"), updateOrderStatus);

export default router;