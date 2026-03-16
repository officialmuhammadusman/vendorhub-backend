import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";
import fs   from "fs";

// ─── Load Cloudinary config here directly ────────────────────────
// This ensures credentials are always set regardless of import order
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Ensure temp folder exists ────────────────────────────────────
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ─── Multer storage ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ApiError(400, "Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ─── Upload to Cloudinary ─────────────────────────────────────────
export const uploadToCloudinary = async (localFilePath, folder = "vendorhub") => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    try { fs.unlinkSync(localFilePath); } catch { /* ignore */ }
    return result;
  } catch (error) {
    try { if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); } catch { /* ignore */ }
    throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
  }
};

// ─── Delete from Cloudinary ───────────────────────────────────────
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(500, "Cloudinary delete failed");
  }
};