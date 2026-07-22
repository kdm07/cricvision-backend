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

const commonPlayerFieldRules = [
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
  body("teamId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Invalid team."),
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
  body("careerEconomy")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99 }),
];

const updateProfileValidator = [
  body("fullName").optional().isString().trim().isLength({ min: 1, max: 120 }),
  ...commonPlayerFieldRules,
  handleValidationErrors,
];

const MAX_SECTION_BODY_BYTES = 20_000;

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

/* ------------------------- admin/staff (Players directory) ------------------------- */

const createPlayerValidator = [
  body("fullName")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Full name is required."),
  ...commonPlayerFieldRules,
  handleValidationErrors,
];

const updatePlayerByIdValidator = [
  param("id").isUUID().withMessage("Invalid player id."),
  body("fullName").optional().isString().trim().isLength({ min: 1, max: 120 }),
  ...commonPlayerFieldRules,
  handleValidationErrors,
];

module.exports = {
  updateProfileValidator,
  updateSectionValidator,
  createPlayerValidator,
  updatePlayerByIdValidator,
};
