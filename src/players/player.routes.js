"use strict";

const express = require("express");
const router = express.Router();

const playerController = require("./player.controller");
const { authenticate } = require("../middlewares/auth");
const {
  updateProfileValidator,
  updateSectionValidator,
} = require("./player.validator");

router.get("/me", authenticate, playerController.getMe);

router.patch(
  "/me",
  authenticate,
  updateProfileValidator,
  playerController.updateMe,
);

// Generic editor for every Cricket/Performance/Fitness/Nutrition/Mindset/
// Medical tab section, e.g. PATCH /players/me/sections/cricketJourney
router.patch(
  "/me/sections/:section",
  authenticate,
  updateSectionValidator,
  playerController.updateSection,
);

router.post(
  "/me/recalculate-snapshot",
  authenticate,
  playerController.recalculateSnapshot,
);

module.exports = router;
