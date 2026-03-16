import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type:     String,
      required: [true, "Full name is required"],
      trim:     true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false, // never returned in queries by default
    },
    role: {
      type:    String,
      enum:    Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    avatar: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    refreshToken: {
      type:   String,
      select: false,
    },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpiry:  { type: Date,   select: false },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────
userSchema.index({ email: 1 });           // fast login lookup
userSchema.index({ role: 1 });            // filter users by role
userSchema.index({ createdAt: -1 });      // sort newest users

// ─── Hash password before save ────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Compare password ─────────────────────────────────────────────
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Generate Access Token ────────────────────────────────────────
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// ─── Generate Refresh Token ───────────────────────────────────────
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);