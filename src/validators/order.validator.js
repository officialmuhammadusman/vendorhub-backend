import { body } from "express-validator";

export const placeOrderValidator = [
  body("paymentIntentId")
    .notEmpty().withMessage("Payment intent ID is required"),

  body("shippingAddress.fullName")
    .notEmpty().withMessage("Full name is required"),

  body("shippingAddress.phone")
    .notEmpty().withMessage("Phone number is required"),

  body("shippingAddress.address")
    .notEmpty().withMessage("Address is required"),

  body("shippingAddress.city")
    .notEmpty().withMessage("City is required"),

  body("shippingAddress.state")
    .notEmpty().withMessage("State is required"),

  body("shippingAddress.postalCode")
    .notEmpty().withMessage("Postal code is required"),
];