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
  };
}

async function getMe(req, res) {
  try {
    // console.log("req.user:", req.user)
    const player = await playerService.getMyProfile(
      req.user.id,
      req.user.fullName,
    );
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

async function recalculateSnapshot(req, res) {
  try {
    const player = await playerService.recalculateMySnapshot(req.user.id);
    return res.status(200).json({ profile: serialize(player) });
  } catch (err) {
    return respondWithError(res, err, "Recalculate snapshot error:");
  }
}

module.exports = { getMe, updateMe, recalculateSnapshot };
