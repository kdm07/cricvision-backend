"use strict";

const express = require("express");
const router = express.Router();

const playerController = require("./player.controller");
const { authenticate } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole");
const {
  updateProfileValidator,
  updateSectionValidator,
  createPlayerValidator,
  updatePlayerByIdValidator,
} = require("./player.validator");

const STAFF_ROLES = ["admin", "analyst", "coach"];

/* ---------------------------- self-service ("me") ---------------------------- */
// Registered before the "/:id" admin routes below so "/me" is never
// swallowed by the ":id" param match.

router.get("/me", authenticate, playerController.getMe);

router.patch(
  "/me",
  authenticate,
  updateProfileValidator,
  playerController.updateMe,
);

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

/* ------------------------- admin/staff (Players directory) ------------------------- */

// Any authenticated user can browse/view the directory (read-only).
router.get("/", authenticate, playerController.list);
router.get("/:id", authenticate, playerController.getById);
router.get(
  "/:id/scouting-detail",
  authenticate,
  playerController.getScoutingDetail,
);

// Only staff can create or edit a tracked player.
router.post(
  "/",
  authenticate,
  // requireRole(STAFF_ROLES),
  createPlayerValidator,
  playerController.create,
);
router.patch(
  "/:id",
  authenticate,
  requireRole(STAFF_ROLES),
  updatePlayerByIdValidator,
  playerController.updateById,
);

module.exports = router;
