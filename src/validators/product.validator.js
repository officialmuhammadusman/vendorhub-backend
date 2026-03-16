import { body } from "express-validator";

export const createProductValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Product title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("discountPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Discount price must be a positive number"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

export const updateProductValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("discountPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Discount price must be a positive number"),
];