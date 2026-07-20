"use strict";

const { body, param, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
}

const categoryParamValidator = [
  param("category")
    .isIn(["strength", "weakness"])
    .withMessage("Invalid category."),
  handleValidationErrors,
];

const createTagValidator = [
  ...categoryParamValidator.slice(0, -1),
  body("label").isString().trim().isLength({ min: 1, max: 120 }),
  body("notes")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 }),
  handleValidationErrors,
];

module.exports = { categoryParamValidator, createTagValidator };
