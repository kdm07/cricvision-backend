"use strict";

const { body, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
}

const VALID_ROLES = ["Batter", "Bowler", "AllRounder", "WicketKeeper"];

const updateProfileValidator = [
  body("fullName").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("role")
    .optional({ nullable: true })
    .isIn(VALID_ROLES)
    .withMessage("Invalid role."),
  body("battingStyle")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 60 }),
  body("bowlingStyle")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 60 }),
  body("jerseyNumber").optional({ nullable: true }).isInt({ min: 0, max: 999 }),
  body("region")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 120 }),
  body("dateOfBirth").optional({ nullable: true }).isISO8601(),

  // Career snapshot — bounded so an editable field can't silently corrupt
  // the UI with negative or absurd values.
  body("careerMatches")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 5000 }),
  body("careerRuns")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200000 }),
  body("careerWickets")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 5000 }),
  body("careerAverage")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999 }),
  body("careerStrikeRate")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999 }),

  handleValidationErrors,
];

module.exports = { updateProfileValidator };
