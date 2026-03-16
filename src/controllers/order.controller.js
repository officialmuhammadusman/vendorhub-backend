import { Order }   from "../models/order.model.js";
import { Cart }    from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Vendor }  from "../models/vendor.model.js";
import { Coupon }  from "../models/coupon.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import stripe from "../config/stripe.js";

// ─── CREATE PAYMENT INTENT ────────────────────────────────────────
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  // Validate all items still in stock
  for (const item of cart.items) {
    if (!item.product.isActive) throw new ApiError(400, `${item.product.title} is no longer available`);
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Only ${item.product.stock} of ${item.product.title} available`);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total    = Math.max(subtotal - (cart.discount || 0), 0);

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(total * 100), // Stripe uses cents
    currency: "usd",
    metadata: {
      userId:  req.user._id.toString(),
      cartId:  cart._id.toString(),
    },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total,
      subtotal,
      discount: cart.discount || 0,
    }, "Payment intent created")
  );
});

// ─── PLACE ORDER (after payment success) ─────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const { paymentIntentId, shippingAddress } = req.body;

  // Verify payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") {
    throw new ApiError(400, "Payment has not been completed");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  // Build order items and deduct stock
  const orderItems = [];
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `${item.product.title} is out of stock`);
    }

    orderItems.push({
      product:  item.product._id,
      vendor:   item.vendor,
      title:    item.product.title,
      image:    item.product.images[0]?.url || "",
      price:    item.price,
      quantity: item.quantity,
    });

    // Deduct stock and increment sold count
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total    = Math.max(subtotal - (cart.discount || 0), 0);

  const order = await Order.create({
    user:            req.user._id,
    items:           orderItems,
    shippingAddress,
    subtotal,
    discount:        cart.discount || 0,
    total,
    coupon:          cart.coupon || null,
    paymentStatus:   "paid",
    paymentIntentId,
    paidAt:          new Date(),
    status:          "confirmed",
  });

  // Update vendor earnings and order counts
  const vendorEarnings = {};
  for (const item of orderItems) {
    const vendorId = item.vendor.toString();
    if (!vendorEarnings[vendorId]) vendorEarnings[vendorId] = 0;
    vendorEarnings[vendorId] += item.price * item.quantity;
  }

  for (const [vendorId, earnings] of Object.entries(vendorEarnings)) {
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: { totalEarnings: earnings, totalOrders: 1 },
    });
  }

  // Mark coupon as used
  if (cart.coupon) {
    await Coupon.findByIdAndUpdate(cart.coupon, {
      $inc: { usedCount: 1 },
      $push: { usedBy: req.user._id },
    });
  }

  // Clear the cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], coupon: null, discount: 0 } }
  );

  return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

// ─── GET MY ORDERS (customer) ─────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("items.product", "title images"),
    Order.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, "Orders fetched")
  );
});

// ─── GET SINGLE ORDER ─────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id:  req.params.id,
    user: req.user._id,
  })
    .populate("items.product", "title images price")
    .populate("items.vendor",  "storeName storeLogo")
    .populate("coupon",        "code discountType discountValue");

  if (!order) throw new ApiError(404, "Order not found");

  return res.status(200).json(new ApiResponse(200, order, "Order fetched"));
});

// ─── CANCEL ORDER (customer) ──────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (!["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  // Refund via Stripe
  if (order.paymentIntentId) {
    await stripe.refunds.create({ payment_intent: order.paymentIntentId });
  }

  order.status        = "cancelled";
  order.paymentStatus = "refunded";
  await order.save();

  // Reverse vendor earnings
  const vendorEarnings = {};
  for (const item of order.items) {
    const vendorId = item.vendor.toString();
    if (!vendorEarnings[vendorId]) vendorEarnings[vendorId] = 0;
    vendorEarnings[vendorId] += item.price * item.quantity;
  }
  for (const [vendorId, earnings] of Object.entries(vendorEarnings)) {
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: { totalEarnings: -earnings, totalOrders: -1 },
    });
  }

  return res.status(200).json(new ApiResponse(200, order, "Order cancelled and refunded"));
});

// ─── UPDATE ORDER STATUS (vendor/admin) ──────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const allowedTransitions = {
    confirmed: ["shipped"],
    shipped:   ["delivered"],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`);
  }

  order.status = status;
  if (status === "delivered") order.deliveredAt = new Date();
  await order.save();

  return res.status(200).json(new ApiResponse(200, order, `Order marked as ${status}`));
});

// ─── STRIPE WEBHOOK ───────────────────────────────────────────────
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig     = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("✅ Payment succeeded:", event.data.object.id);
      break;

    case "payment_intent.payment_failed":
      console.log("❌ Payment failed:", event.data.object.id);
      await Order.findOneAndUpdate(
        { paymentIntentId: event.data.object.id },
        { paymentStatus: "failed" }
      );
      break;

    case "charge.refunded":
      console.log("↩️ Charge refunded:", event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// ─── GET VENDOR ORDERS ────────────────────────────────────────────
export const getVendorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  // Find vendor profile for this user
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const query = { "items.vendor": vendor._id };
  if (status) query.status = status;

  const skip   = (Number(page) - 1) * Number(limit);
  const total  = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "fullName email")
    .populate("items.product", "title images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        total,
        page:       Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Vendor orders fetched")
  );
});