"use strict";

const express = require("express");
const router = express.Router();

const playerTagController = require("./playerTag.controller");
const { authenticate } = require("../middlewares/auth");
const {
  categoryParamValidator,
  createTagValidator,
} = require("./playerTag.validator");

// category = "strength" | "weakness"
router.get(
  "/me/tags/:category",
  authenticate,
  categoryParamValidator,
  playerTagController.list,
);
router.post(
  "/me/tags/:category",
  authenticate,
  createTagValidator,
  playerTagController.create,
);
router.delete("/me/tags/:id", authenticate, playerTagController.remove);

module.exports = router;
