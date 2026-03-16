import { User }    from "../models/user.model.js";
import { Vendor }  from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";
import { Order }   from "../models/order.model.js";
import { Coupon }  from "../models/coupon.model.js";
import { Review }  from "../models/review.model.js";
import { ApiError }     from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── PLATFORM OVERVIEW STATS ──────────────────────────────────────
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    revenueData,
    pendingVendors,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Vendor.countDocuments({ status: "approved" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]),
    Vendor.countDocuments({ status: "pending" }),
    Order.find({ paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "fullName email"),
  ]);

  // Monthly revenue for chart
  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year:  { $year:  "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue:   revenueData[0]?.totalRevenue || 0,
      pendingVendors,
      recentOrders,
      monthlyRevenue,
    }, "Platform stats fetched")
  );
});

// ─── GET ALL USERS ────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role)   query.role = role;
  if (search) query.$or  = [
    { fullName: { $regex: search, $options: "i" } },
    { email:    { $regex: search, $options: "i" } },
  ];

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, "Users fetched")
  );
});

// ─── BAN / UNBAN USER ─────────────────────────────────────────────
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot ban an admin");

  user.isActive = !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, `User ${user.isActive ? "unbanned" : "banned"} successfully`)
  );
});

// ─── GET ALL VENDORS ──────────────────────────────────────────────
export const getAllVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .populate("user", "fullName email avatar isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Vendor.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      vendors,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, "Vendors fetched")
  );
});

// ─── APPROVE VENDOR ───────────────────────────────────────────────
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).populate("user");
  if (!vendor) throw new ApiError(404, "Vendor not found");
  if (vendor.status === "approved") throw new ApiError(400, "Vendor is already approved");

  vendor.status = "approved";
  await vendor.save();

  return res.status(200).json(new ApiResponse(200, vendor, "Vendor approved successfully"));
});

// ─── SUSPEND VENDOR ───────────────────────────────────────────────
export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  vendor.status = "suspended";
  await vendor.save();

  // Deactivate all vendor products
  await Product.updateMany({ vendor: vendor._id }, { isActive: false });

  return res.status(200).json(new ApiResponse(200, vendor, "Vendor suspended and products deactivated"));
});

// ─── GET ALL ORDERS ───────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus } = req.query;
  const query = {};
  if (status)        query.status        = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, "All orders fetched")
  );
});

// ─── GET ALL PRODUCTS (admin view) ───────────────────────────────
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("vendor", "storeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, "Products fetched")
  );
});

// ─── REMOVE ANY PRODUCT ───────────────────────────────────────────
export const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw new ApiError(404, "Product not found");
  return res.status(200).json(new ApiResponse(200, {}, "Product removed from platform"));
});

// ─── DELETE ANY REVIEW ────────────────────────────────────────────
export const deleteReviewAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  return res.status(200).json(new ApiResponse(200, {}, "Review deleted"));
});