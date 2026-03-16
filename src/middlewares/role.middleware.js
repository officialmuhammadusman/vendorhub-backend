import { ApiError } from "../utils/ApiError.js";

// Usage: verifyRole("admin") or verifyRole("vendor", "admin")
export const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required role: ${roles.join(" or ")}`);
    }
    next();
  };
};