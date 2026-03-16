export const USER_ROLES = {
  CUSTOMER : "customer",
  VENDOR   : "vendor",
  ADMIN    : "admin",
};

export const ORDER_STATUS = {
  PENDING   : "pending",
  CONFIRMED : "confirmed",
  SHIPPED   : "shipped",
  DELIVERED : "delivered",
  CANCELLED : "cancelled",
  REFUNDED  : "refunded",
};

export const PAYMENT_STATUS = {
  PENDING  : "pending",
  PAID     : "paid",
  FAILED   : "failed",
  REFUNDED : "refunded",
};

export const VENDOR_STATUS = {
  PENDING   : "pending",
  APPROVED  : "approved",
  SUSPENDED : "suspended",
};

export const LOW_STOCK_THRESHOLD = 5;

export const COOKIE_OPTIONS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === "production",
  sameSite : "strict",
};