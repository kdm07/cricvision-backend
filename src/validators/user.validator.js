const { body } = require("express-validator");

exports.createUserValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .isIn(["admin", "analyst", "coach", "player"])
    .withMessage("Invalid role"),
];
