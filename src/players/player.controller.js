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
    sections: player.extendedProfile || {},
  };
}

/** Serializer for the admin/staff Players directory + scouting profile —
 * includes the team and economy figure that self-service "me" doesn't need. */
function serializeRoster(player, team) {
  return {
    id: player.id,
    fullName: player.fullName,
    role: player.role,
    battingStyle: player.battingStyle,
    bowlingStyle: player.bowlingStyle,
    dateOfBirth: player.dateOfBirth,
    jerseyNumber: player.jerseyNumber,
    region: player.region,
    team: team ? { id: team.id, name: team.name } : null,
    careerSnapshot: {
      careerMatches: player.careerMatches,
      careerRuns: player.careerRuns,
      careerWickets: player.careerWickets,
      careerAverage: Number(player.careerAverage),
      careerStrikeRate: Number(player.careerStrikeRate),
      careerEconomy: Number(player.careerEconomy),
    },
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

/* ------------------------- admin/staff (Players directory) ------------------------- */

async function list(req, res) {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const rows = await playerService.listPlayers(search);
    return res.status(200).json({
      players: rows.map(({ player, team }) => serializeRoster(player, team)),
    });
  } catch (err) {
    return respondWithError(res, err, "List players error:");
  }
}

async function getById(req, res) {
  try {
    const { player, team } = await playerService.getPlayerById(req.params.id);
    return res.status(200).json({ player: serializeRoster(player, team) });
  } catch (err) {
    return respondWithError(res, err, "Get player error:");
  }
}

async function create(req, res) {
  try {
    const { player, team } = await playerService.createPlayer(req.body);
    return res.status(201).json({ player: serializeRoster(player, team) });
  } catch (err) {
    return respondWithError(res, err, "Create player error:");
  }
}

async function updateById(req, res) {
  try {
    const { player, team } = await playerService.updatePlayerById(
      req.params.id,
      req.body,
    );
    return res.status(200).json({ player: serializeRoster(player, team) });
  } catch (err) {
    return respondWithError(res, err, "Update player error:");
  }
}

async function getScoutingDetail(req, res) {
  try {
    const detail = await playerService.getScoutingDetail(req.params.id);
    return res.status(200).json(detail);
  } catch (err) {
    return respondWithError(res, err, "Get scouting detail error:");
  }
}

module.exports = {
  getMe,
  updateMe,
  updateSection,
  recalculateSnapshot,
  list,
  getById,
  create,
  updateById,
  getScoutingDetail,
};
