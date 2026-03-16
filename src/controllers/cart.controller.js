import { Cart }    from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon }  from "../models/coupon.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── GET CART ─────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "title images price stock isActive")
    .populate("items.vendor",  "storeName storeLogo")
    .populate("coupon",        "code discountType discountValue");

  if (!cart) {
    return res.status(200).json(new ApiResponse(200, { items: [], subtotal: 0, total: 0 }, "Cart is empty"));
  }

  return res.status(200).json(new ApiResponse(200, cart, "Cart fetched"));
});

// ─── ADD TO CART ──────────────────────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId).populate("vendor");
  if (!product || !product.isActive) throw new ApiError(404, "Product not found");
  if (product.stock < quantity)      throw new ApiError(400, `Only ${product.stock} items in stock`);

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      user:  req.user._id,
      items: [{ product: productId, vendor: product.vendor._id, quantity, price }],
    });
  } else {
    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        throw new ApiError(400, `Only ${product.stock} items available`);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: productId, vendor: product.vendor._id, quantity, price });
    }

    await cart.save();
  }

  await cart.populate("items.product", "title images price stock");
  return res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

// ─── UPDATE CART ITEM QUANTITY ────────────────────────────────────
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity }  = req.body;

  if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  item.quantity = quantity;
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
});

// ─── REMOVE ITEM FROM CART ────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);

  // Remove coupon if cart is now empty
  if (cart.items.length === 0) {
    cart.coupon   = null;
    cart.discount = 0;
  }

  await cart.save();
  return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

// ─── CLEAR CART ───────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], coupon: null, discount: 0 } }
  );
  return res.status(200).json(new ApiResponse(200, {}, "Cart cleared"));
});

// ─── APPLY COUPON ─────────────────────────────────────────────────
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid or expired coupon code");

  // Check expiry
  if (new Date() > coupon.expiresAt) throw new ApiError(400, "Coupon has expired");

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  // Check if user already used this coupon
  if (coupon.usedBy.includes(req.user._id)) {
    throw new ApiError(400, "You have already used this coupon");
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check minimum order amount
  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount is $${coupon.minOrderAmount}`);
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal); // discount can't exceed subtotal

  cart.coupon   = coupon._id;
  cart.discount = discount;
  await cart.save();

  return res.status(200).json(
    new ApiResponse(200, {
      discount,
      total: subtotal - discount,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    }, "Coupon applied successfully")
  );
});

// ─── REMOVE COUPON ────────────────────────────────────────────────
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.coupon   = null;
  cart.discount = 0;
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Coupon removed"));
});