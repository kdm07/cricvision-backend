const { body, validationResult } = require("express-validator");

const loginValidator = [
  body("email")
  .isEmail()
  .withMessage("Enter a valid email address")
  .normalizeEmail({
    gmail_remove_dots: false,
  }),
  body("password")
    .isString()
    .isLength({ min: 1 })
    .withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { loginValidator };
