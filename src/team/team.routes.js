"use strict";

const express = require("express");
const router = express.Router();

const teamController = require("./team.controller");
const { authenticate } = require("../middlewares/auth");

router.get("/", authenticate, teamController.list);

module.exports = router;

/**
 * Mount alongside the existing player routes in your app entry point:
 *
 *   app.use("/players", require("./player/player.routes"));
 *   app.use("/teams", require("./team/team.routes"));
 */
