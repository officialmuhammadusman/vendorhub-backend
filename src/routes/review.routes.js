import { Router } from "express";
import {
  createReview, getProductReviews,
  updateReview, deleteReview, getMyReviews,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload }    from "../utils/fileUpload.js";

const router = Router();

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     description: Public route. Filter by star rating. Returns rating distribution.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, enum: [1, 2, 3, 4, 5] }
 *         description: Filter by specific star rating
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: Reviews with rating distribution
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 reviews:
 *                   - rating: 5
 *                     comment: "Amazing product!"
 *                     isVerifiedPurchase: true
 *                     user: { fullName: "John Customer" }
 *                 distribution:
 *                   - _id: 5
 *                     count: 10
 *                   - _id: 4
 *                     count: 5
 */
router.get("/product/:productId", getProductReviews);

router.use(verifyJWT);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Write a review (verified purchase only)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       **Rules:**
 *       - Must have purchased the product (order exists)
 *       - Order status must be **delivered**
 *       - One review per product per user
 *       - Product average rating auto-updates after save
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Review submitted with verified purchase badge
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 rating: 5
 *                 comment: "Absolutely amazing product!"
 *                 isVerifiedPurchase: true
 *       403:
 *         description: Must purchase and receive product first
 *       409:
 *         description: Already reviewed this product
 */
router.post("/", upload.array("images", 3), createReview);

/**
 * @swagger
 * /reviews/my-reviews:
 *   get:
 *     summary: Get all reviews I have written
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: My reviews list with product info
 */
router.get("/my-reviews", getMyReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update my review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReview'
 *     responses:
 *       200:
 *         description: Review updated — product rating recalculated
 */
router.patch("/:id", updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete my review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted — product rating recalculated
 */
router.delete("/:id", deleteReview);

export default router;