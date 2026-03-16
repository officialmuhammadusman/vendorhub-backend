import { Router } from "express";
import {
  register, login, logout,
  refreshAccessToken, getCurrentUser,
  changePassword, updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT }   from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { validate }    from "../middlewares/validate.middleware.js";
import { registerValidator, loginValidator, changePasswordValidator } from "../validators/auth.validator.js";
import { upload }      from "../utils/fileUpload.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: |
 *       Register as **customer**, **vendor**, or **admin**.
 *       - Customer → can shop, add to cart, place orders, write reviews
 *       - Vendor → must setup store profile after registering, then await admin approval
 *       - Admin → full platform access
 *
 *       **Test Data:**
 *       - Customer: customer@test.com / Test@1234
 *       - Vendor:   vendor@test.com / Test@1234
 *       - Admin:    admin@test.com / Test@1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/RegisterCustomer'
 *               - $ref: '#/components/schemas/RegisterVendor'
 *               - $ref: '#/components/schemas/RegisterAdmin'
 *           examples:
 *             customer:
 *               summary: Register as Customer
 *               value:
 *                 fullName: "John Customer"
 *                 email: "customer@test.com"
 *                 password: "Test@1234"
 *                 role: "customer"
 *             vendor:
 *               summary: Register as Vendor
 *               value:
 *                 fullName: "Jane Vendor"
 *                 email: "vendor@test.com"
 *                 password: "Test@1234"
 *                 role: "vendor"
 *             admin:
 *               summary: Register as Admin
 *               value:
 *                 fullName: "Super Admin"
 *                 email: "admin@test.com"
 *                 password: "Test@1234"
 *                 role: "admin"
 *     responses:
 *       201:
 *         description: User registered successfully — returns accessToken
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               message: "Account created successfully"
 *               data:
 *                 user:
 *                   _id: "64abc123..."
 *                   fullName: "John Customer"
 *                   email: "customer@test.com"
 *                   role: "customer"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User with this email already exists"
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/ValidationError'
 */
router.post("/register", authLimiter, upload.single("avatar"), registerValidator, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: |
 *       Login with email and password.
 *       Copy the **accessToken** from response and click **Authorize** button at top of this page to use protected routes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             customer:
 *               summary: Login as Customer
 *               value:
 *                 email: "customer@test.com"
 *                 password: "Test@1234"
 *             vendor:
 *               summary: Login as Vendor
 *               value:
 *                 email: "vendor@test.com"
 *                 password: "Test@1234"
 *             admin:
 *               summary: Login as Admin
 *               value:
 *                 email: "admin@test.com"
 *                 password: "Test@1234"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: "Logged in successfully"
 *               data:
 *                 user:
 *                   _id: "64abc123..."
 *                   fullName: "John Customer"
 *                   email: "customer@test.com"
 *                   role: "customer"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account suspended
 */
router.post("/login", authLimiter, loginValidator, validate, login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     description: Access token expires in 15 minutes. Use this to get a new one silently.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: New access token returned
 *       401:
 *         description: Refresh token invalid or expired — user must login again
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     description: Clears cookies and invalidates refresh token in database.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized — no token provided
 */
router.post("/logout", verifyJWT, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     description: Returns full profile of the currently authenticated user.
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "64abc123..."
 *                 fullName: "John Customer"
 *                 email: "customer@test.com"
 *                 role: "customer"
 *                 isActive: true
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyJWT, getCurrentUser);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Old password is incorrect
 */
router.patch("/change-password", verifyJWT, changePasswordValidator, validate, changePassword);

/**
 * @swagger
 * /auth/update-profile:
 *   patch:
 *     summary: Update profile name and avatar
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, example: "John Updated Name" }
 *               avatar:   { type: string, format: binary, description: "Profile picture max 5MB" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch("/update-profile", verifyJWT, upload.single("avatar"), updateProfile);

export default router;