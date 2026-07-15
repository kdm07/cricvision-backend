"use strict";

const { body, validationResult } = require("express-validator");

/**
 * ai.validator.js
 * ----------------------------------------------------------------------------
 * Request validation for AI Coach endpoints, following the same
 * express-validator convention used by auth.validator.js. Runs BEFORE the
 * controller so ai.controller.js can assume req.body is well-formed.
 */

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const chatValidator = [
  body("message")
    .exists({ checkFalsy: true })
    .withMessage("Message is required.")
    .bail()
    .isString()
    .withMessage("Message must be text.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage("Message must be between 1 and 4000 characters."),
  body("conversationId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("conversationId must be a positive integer."),
  handleValidationErrors,
];

module.exports = {
  chatValidator,
};
