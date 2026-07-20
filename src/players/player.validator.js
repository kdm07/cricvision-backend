"use strict";

const { body, param, validationResult } = require("express-validator");
const { EDITABLE_SECTIONS } = require("./player.constants");

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

// Generic section-editor validator, used by PATCH /players/me/sections/:section.
// The section name is checked against the canonical list so a typo or a
// tampered request can't write an arbitrary new key into the JSON blob.
// The body itself is intentionally loosely validated (object or array,
// reasonable size cap) since each of the 27 sections has its own shape —
// tightening a specific section's shape further is a one-line addition
// here if you want stricter guarantees for that section later.
const MAX_SECTION_BODY_BYTES = 20_000; // ~20kb, generous for a list of rows

const updateSectionValidator = [
  param("section")
    .isIn(EDITABLE_SECTIONS)
    .withMessage("Unknown profile section."),
  body().custom((value) => {
    if (value === null || typeof value !== "object") {
      throw new Error("Section body must be a JSON object or array.");
    }
    if (JSON.stringify(value).length > MAX_SECTION_BODY_BYTES) {
      throw new Error("Section body is too large.");
    }
    return true;
  }),
  handleValidationErrors,
];

module.exports = { updateProfileValidator, updateSectionValidator };
