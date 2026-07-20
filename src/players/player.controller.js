"use strict";

const playerService = require("./player.service");
const { ApiError } = require("../utils/apiError");

function respondWithError(res, err, fallbackMessage) {
  if (err instanceof ApiError)
    return res.status(err.statusCode).json({ error: err.message });
  console.error(fallbackMessage, err);
  return res
    .status(500)
    .json({ error: "Something went wrong, please try again" });
}

function serialize(player) {
  return {
    id: player.id,
    fullName: player.fullName,
    role: player.role,
    battingStyle: player.battingStyle,
    bowlingStyle: player.bowlingStyle,
    dateOfBirth: player.dateOfBirth,
    profilePhotoUrl: player.profilePhotoUrl,
    jerseyNumber: player.jerseyNumber,
    region: player.region,
    careerSnapshot: {
      careerMatches: player.careerMatches,
      careerRuns: player.careerRuns,
      careerWickets: player.careerWickets,
      careerAverage: Number(player.careerAverage),
      careerStrikeRate: Number(player.careerStrikeRate),
    },
    // Every editable tab section (Cricket/Performance/Fitness/Nutrition/
    // Mindset/Medical), keyed by section name. Empty object for a
    // brand-new player who hasn't edited anything yet — the frontend
    // falls back to its own display defaults in that case.
    sections: player.extendedProfile || {},
  };
}

async function getMe(req, res) {
  try {
    const player = await playerService.getMyProfile(req.user.id);
    return res.status(200).json({ profile: serialize(player) });
  } catch (err) {
    return respondWithError(res, err, "Get player profile error:");
  }
}

async function updateMe(req, res) {
  try {
    const player = await playerService.updateMyProfile(req.user.id, req.body);
    return res.status(200).json({ profile: serialize(player) });
  } catch (err) {
    return respondWithError(res, err, "Update player profile error:");
  }
}

async function updateSection(req, res) {
  try {
    const { section } = req.params;
    const player = await playerService.updateMySection(
      req.user.id,
      section,
      req.body,
    );
    return res.status(200).json({ profile: serialize(player) });
  } catch (err) {
    return respondWithError(res, err, "Update player section error:");
  }
}

async function recalculateSnapshot(req, res) {
  try {
    const player = await playerService.recalculateMySnapshot(req.user.id);
    return res.status(200).json({ profile: serialize(player) });
  } catch (err) {
    return respondWithError(res, err, "Recalculate snapshot error:");
  }
}

module.exports = { getMe, updateMe, updateSection, recalculateSnapshot };
