import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";
import { COOKIE_OPTIONS } from "../constants/index.js";

// ─── Helper: generate tokens and set cookies ──────────────────────
const sendTokenResponse = async (user, statusCode, res, message) => {
  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(statusCode)
    .cookie("accessToken",  accessToken,  { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json(
      new ApiResponse(statusCode, {
        user: {
          _id:      user._id,
          fullName: user.fullName,
          email:    user.email,
          role:     user.role,
          avatar:   user.avatar,
        },
        accessToken,
      }, message)
    );
};

// ─── REGISTER ─────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Handle avatar upload if provided
  let avatar = { url: "", publicId: "" };
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.path, "vendorhub/avatars");
    avatar = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  const user = await User.create({ fullName, email, password, role, avatar });

  return sendTokenResponse(user, 201, res, "Account created successfully");
});

// ─── LOGIN ────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Need password field (select: false by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been suspended. Contact support.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return sendTokenResponse(user, 200, res, "Logged in successfully");
});

// ─── LOGOUT ───────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken",  COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    return sendTokenResponse(user, 200, res, "Access token refreshed");
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isOldPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordValid) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  const updateData = {};
  if (fullName) updateData.fullName = fullName;

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.path, "vendorhub/avatars");
    updateData.avatar = {
      url:      uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});