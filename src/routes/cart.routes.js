import { Router } from "express";
import {
  getCart, addToCart, updateCartItem,
  removeFromCart, clearCart, applyCoupon, removeCoupon,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get my cart with subtotal, discount and total
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: Login as customer first. Returns empty cart object if cart has no items.
 *     responses:
 *       200:
 *         description: Cart data
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 items:
 *                   - product: { title: "iPhone 15 Case", price: 24.99 }
 *                     quantity: 2
 *                     price: 24.99
 *                 subtotal: 49.98
 *                 discount: 9.99
 *                 total: 39.99
 *                 coupon: { code: "SAVE20" }
 */
router.get("/", getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       If product already in cart, quantity is added to existing.
 *       Stock is validated before adding.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCart'
 *     responses:
 *       200:
 *         description: Product added to cart
 *       400:
 *         description: Not enough stock available
 *       404:
 *         description: Product not found or inactive
 */
router.post("/add", addToCart);

/**
 * @swagger
 * /cart/item/{productId}:
 *   patch:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItem'
 *     responses:
 *       200:
 *         description: Quantity updated
 *       400:
 *         description: Not enough stock
 */
router.patch("/item/:productId", updateCartItem);

/**
 * @swagger
 * /cart/item/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/item/:productId", removeFromCart);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/clear", clearCart);

/**
 * @swagger
 * /cart/apply-coupon:
 *   post:
 *     summary: Apply coupon code to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       **Test coupons:**
 *       - SAVE20 → 20% off, min order $50, max discount $30
 *       - FLAT10 → $10 flat off, min order $30
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyCoupon'
 *     responses:
 *       200:
 *         description: Coupon applied
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 discount: 9.99
 *                 total: 39.99
 *                 coupon: { code: "SAVE20", discountType: "percentage", discountValue: 20 }
 *       400:
 *         description: Cart empty / min order not met / already used / limit reached
 *       404:
 *         description: Invalid or expired coupon code
 */
router.post("/apply-coupon", applyCoupon);

/**
 * @swagger
 * /cart/remove-coupon:
 *   delete:
 *     summary: Remove applied coupon
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed — discount reset to 0
 */
router.delete("/remove-coupon", removeCoupon);

export default router;