import { Router } from "express";
import {
  createProduct, getAllProducts, getProductById,
  updateProduct, deleteProduct, deleteProductImage,
  getMyProducts, updateStock,
} from "../controllers/product.controller.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { validate }   from "../middlewares/validate.middleware.js";
import { createProductValidator, updateProductValidator } from "../validators/product.validator.js";
import { upload }     from "../utils/fileUpload.js";

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters, search and pagination
 *     tags: [Products]
 *     description: |
 *       Public route. Supports full-text search, category filter, price range, sorting.
 *       **Test queries:**
 *       - Search: ?search=iphone
 *       - Category: ?category=accessories
 *       - Price range: ?minPrice=10&maxPrice=100
 *       - Sort by price: ?sort=price&order=asc
 *       - Top rated: ?sort=ratings.average&order=desc
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         example: iphone
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         example: accessories
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *         example: 10
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         example: 100
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price, createdAt, "ratings.average", sold] }
 *         example: createdAt
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *         example: desc
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 12
 *     responses:
 *       200:
 *         description: Products with pagination info
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 products: []
 *                 pagination:
 *                   total: 100
 *                   page: 1
 *                   limit: 12
 *                   totalPages: 9
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get single product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: "64abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Full product with vendor info and ratings
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById);

router.use(verifyJWT, verifyRole("vendor", "admin"));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (vendor only — store must be approved)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       **Requires:** Login as vendor + store approved by admin.
 *       Use multipart/form-data. Upload up to 5 images.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 _id: "64abc123..."
 *                 title: "iPhone 15 Pro Max Case"
 *                 price: 29.99
 *                 discountPrice: 24.99
 *                 stock: 100
 *                 category: "accessories"
 *                 images: [{ url: "https://res.cloudinary.com/...", publicId: "vendorhub/products/..." }]
 *       403:
 *         description: Store not approved yet
 */
router.post("/", upload.array("images", 5), createProductValidator, validate, createProduct);

/**
 * @swagger
 * /products/vendor/my-products:
 *   get:
 *     summary: Get all my products as vendor
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Returns products with isLowStock flag when stock <= 5
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: My products list with low stock flags
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 products:
 *                   - title: "iPhone 15 Case"
 *                     stock: 3
 *                     isLowStock: true
 */
router.get("/vendor/my-products", getMyProducts);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product (vendor only)
 *     tags: [Products]
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
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Not your product
 */
router.patch("/:id", upload.array("images", 5), updateProductValidator, validate, updateProduct);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Update stock only — triggers low stock alert if <= 5
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Set stock to 3 or less to see the low stock alert in response.
 *       **Test:** set stock to 3 → response will include warning message.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStock'
 *     responses:
 *       200:
 *         description: Stock updated
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 isLowStock: true
 *                 message: "⚠️ Low stock alert! Only 3 items left."
 */
router.patch("/:id/stock", updateStock);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product and remove images from Cloudinary
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 *       403:
 *         description: Not your product
 */
router.delete("/:id", deleteProduct);

/**
 * @swagger
 * /products/{productId}/images/{publicId}:
 *   delete:
 *     summary: Delete one image from product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema: { type: string }
 *         description: Cloudinary public_id of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted
 *       400:
 *         description: Cannot delete — product must have at least 1 image
 */
router.delete("/:productId/images/:publicId", deleteProductImage);

export default router;