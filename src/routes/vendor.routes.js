import { Router } from "express";
import {
  setupVendorProfile, getMyVendorProfile, updateVendorProfile,
  getVendorDashboard, getEarningsAnalytics, getVendorStore,
} from "../controllers/vendor.controller.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import { upload }     from "../utils/fileUpload.js";

const router = Router();

/**
 * @swagger
 * /vendors/store/{vendorId}:
 *   get:
 *     summary: Get public vendor store with all products
 *     tags: [Vendor]
 *     description: Public route — no login required. Returns store info + all active products.
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *         example: "64abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Vendor store with products
 *       404:
 *         description: Store not found or not approved yet
 */
router.get("/store/:vendorId", getVendorStore);

/**
 * @swagger
 * /vendors/setup:
 *   post:
 *     summary: Setup vendor store profile
 *     tags: [Vendor]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       **Login as vendor first**, then call this to create your store.
 *       After setup, admin must approve before you can add products.
 *       Use multipart/form-data (not JSON) because of file uploads.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VendorSetup'
 *           example:
 *             storeName: "Tech Haven Store"
 *             storeDescription: "Best electronics at affordable prices"
 *             bankDetails[accountName]: "Jane Vendor"
 *             bankDetails[accountNumber]: "1234567890"
 *             bankDetails[bankName]: "HBL Bank"
 *     responses:
 *       201:
 *         description: Vendor profile created — status is PENDING until admin approves
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Vendor profile created. Awaiting approval."
 *               data:
 *                 _id: "64abc123..."
 *                 storeName: "Tech Haven Store"
 *                 status: "pending"
 *       409:
 *         description: Vendor profile already exists or store name taken
 */
router.post("/setup", verifyJWT, upload.fields([{ name: "storeLogo", maxCount: 1 }, { name: "storeBanner", maxCount: 1 }]), setupVendorProfile);

router.use(verifyJWT, verifyRole("vendor", "admin"));

/**
 * @swagger
 * /vendors/me:
 *   get:
 *     summary: Get my vendor profile
 *     tags: [Vendor]
 *     security:
 *       - BearerAuth: []
 *     description: Login as vendor to see your store details, status, earnings summary.
 *     responses:
 *       200:
 *         description: Vendor profile
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 storeName: "Tech Haven Store"
 *                 status: "approved"
 *                 totalEarnings: 1250.50
 *                 totalOrders: 45
 *                 totalProducts: 12
 */
router.get("/me", getMyVendorProfile);

/**
 * @swagger
 * /vendors/dashboard:
 *   get:
 *     summary: Get vendor dashboard stats
 *     tags: [Vendor]
 *     security:
 *       - BearerAuth: []
 *     description: Returns total products, low stock count, recent orders, earnings.
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 storeName: "Tech Haven Store"
 *                 status: "approved"
 *                 totalEarnings: 1250.50
 *                 totalOrders: 45
 *                 totalProducts: 12
 *                 lowStockProducts: 2
 *                 recentOrders: []
 */
router.get("/dashboard", getVendorDashboard);

/**
 * @swagger
 * /vendors/earnings:
 *   get:
 *     summary: Get monthly earnings analytics for Recharts
 *     tags: [Vendor]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings breakdown by month
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 totalEarnings: 1250.50
 *                 totalOrders: 45
 *                 monthlyEarnings:
 *                   - month: "Jan 2024"
 *                     earnings: 320.00
 *                   - month: "Feb 2024"
 *                     earnings: 450.50
 */
router.get("/earnings", getEarningsAnalytics);

/**
 * @swagger
 * /vendors/update:
 *   patch:
 *     summary: Update vendor store profile
 *     tags: [Vendor]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VendorUpdate'
 *     responses:
 *       200:
 *         description: Vendor profile updated
 */
router.patch("/update", upload.fields([{ name: "storeLogo", maxCount: 1 }, { name: "storeBanner", maxCount: 1 }]), updateVendorProfile);

export default router;