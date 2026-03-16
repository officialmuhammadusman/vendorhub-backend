import { Router } from "express";
import {
  getPlatformStats, getAllUsers, toggleUserStatus,
  getAllVendors, approveVendor, suspendVendor,
  getAllOrders, getAllProductsAdmin,
  removeProduct, deleteReviewAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT, verifyRole("admin"));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get full platform statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Returns: totalUsers, totalVendors, totalProducts, totalOrders,
 *       totalRevenue, pendingVendors, recentOrders, monthlyRevenue chart data
 *     responses:
 *       200:
 *         description: Platform analytics dashboard data
 */
router.get("/stats", getPlatformStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [customer, vendor, admin] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users list with pagination
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/toggle:
 *   patch:
 *     summary: Ban or unban a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User banned or unbanned
 *       403:
 *         description: Cannot ban an admin
 */
router.patch("/users/:id/toggle", toggleUserStatus);

/**
 * @swagger
 * /admin/vendors:
 *   get:
 *     summary: Get all vendors (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, suspended] }
 *         description: Filter by vendor status
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Vendors list
 */
router.get("/vendors", getAllVendors);

/**
 * @swagger
 * /admin/vendors/{id}/approve:
 *   patch:
 *     summary: Approve a vendor (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor approved — can now add products
 *       400:
 *         description: Vendor already approved
 */
router.patch("/vendors/:id/approve", approveVendor);

/**
 * @swagger
 * /admin/vendors/{id}/suspend:
 *   patch:
 *     summary: Suspend a vendor and deactivate all their products
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor suspended and all products deactivated
 */
router.patch("/vendors/:id/suspend", suspendVendor);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all platform orders (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, enum: [pending, paid, failed, refunded] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: All orders with pagination
 */
router.get("/orders", getAllOrders);

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all platform products (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: All products
 */
router.get("/products", getAllProductsAdmin);

/**
 * @swagger
 * /admin/products/{id}:
 *   patch:
 *     summary: Remove (deactivate) any product from the platform
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deactivated from platform
 */
router.patch("/products/:id", removeProduct);

/**
 * @swagger
 * /admin/reviews/{id}:
 *   delete:
 *     summary: Delete any review (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete("/reviews/:id", deleteReviewAdmin);

export default router;