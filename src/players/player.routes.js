"use strict";

const express = require("express");
const router = express.Router();

const playerController = require("./player.controller");
const { authenticate } = require("../middlewares/auth");
const { updateProfileValidator } = require("./player.validator");

router.get("/me", authenticate, playerController.getMe);
router.patch(
  "/me",
  authenticate,
  updateProfileValidator,
  playerController.updateMe,
);
router.post(
  "/me/recalculate-snapshot",
  authenticate,
  playerController.recalculateSnapshot,
);

module.exports = router;
