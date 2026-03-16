import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating authentication tokens");
  }
};

export { generateAccessToken, generateRefreshToken, generateAccessAndRefreshTokens };