"use strict";

const { Op } = require("sequelize");
const {
  Player,
  PlayerMatchStat,
  Match,
  TeamRoster,
  Team,
  PlayerTag,
  Tag,
  AttitudeRating,
  VideoClip,
  sequelize,
  User,
} = require("../database/models");

async function findByUserId(userId) {
  return Player.findOne({ where: { userId } });
}

async function findById(id) {
  return Player.findByPk(id);
}

async function createForUser(userId, fullName) {
  return Player.create({ userId, fullName, role: null });
}

const EDITABLE_HERO_FIELDS = [
  "fullName",
  "role",
  "battingStyle",
  "bowlingStyle",
  "dateOfBirth",
  "profilePhotoUrl",
  "jerseyNumber",
  "region",
];

const EDITABLE_SNAPSHOT_FIELDS = [
  "careerMatches",
  "careerRuns",
  "careerWickets",
  "careerAverage",
  "careerStrikeRate",
  "careerEconomy",
];

function pickEditableFields(fields) {
  const updates = {};
  for (const key of [...EDITABLE_HERO_FIELDS, ...EDITABLE_SNAPSHOT_FIELDS]) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      updates[key] = fields[key];
    }
  }
  return updates;
}

async function updateByUserId(userId, fields) {
  const player = await findByUserId(userId);
  if (!player) return null;
  await player.update(pickEditableFields(fields));
  return player;
}

/** Admin/staff update-by-id (Players directory), as opposed to the
 * self-service updateByUserId used by "My Profile". */
async function updateById(id, fields) {
  const player = await findById(id);
  if (!player) return null;
  await player.update(pickEditableFields(fields));
  if (Object.prototype.hasOwnProperty.call(fields, "teamId")) {
    await assignTeam(id, fields.teamId);
  }
  return player;
}

/** Directly creates a Player row not necessarily tied to a User login —
 * covers scouted/tracked players who don't have (or don't yet have) an
 * account of their own. */
async function createPlayer(fields) {
  const player = await Player.create({
    fullName: fields.fullName,
    role: fields.role ?? null,
    battingStyle: fields.battingStyle ?? null,
    bowlingStyle: fields.bowlingStyle ?? null,
    dateOfBirth: fields.dateOfBirth ?? null,
    jerseyNumber: fields.jerseyNumber ?? null,
    region: fields.region ?? null,
    careerMatches: fields.careerMatches ?? 0,
    careerRuns: fields.careerRuns ?? 0,
    careerWickets: fields.careerWickets ?? 0,
    careerAverage: fields.careerAverage ?? 0,
    careerStrikeRate: fields.careerStrikeRate ?? 0,
    careerEconomy: fields.careerEconomy ?? 0,
  });
  if (fields.teamId) {
    await assignTeam(player.id, fields.teamId);
  }
  return player;
}

/** Closes any currently-active roster row for this player and opens a new
 * one for the given team (or just closes the old one if teamId is null,
 * i.e. "Unassigned"). */
async function assignTeam(playerId, teamId) {
  const now = new Date();
  await TeamRoster.update(
    { endDate: now },
    { where: { playerId, endDate: null } },
  );
  if (teamId) {
    await TeamRoster.create({
      playerId,
      teamId,
      startDate: now,
      endDate: null,
    });
  }
}

async function getCurrentTeam(playerId) {
  const roster = await TeamRoster.findOne({
    where: { playerId, endDate: null },
    include: [{ model: Team }],
    order: [["startDate", "DESC"]],
  });
  return roster ? roster.Team : null;
}

async function listAll({ search } = {}) {
  const where = {};
  if (search && search.trim()) {
    where[Op.and] = [
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("fullName")),
        "LIKE",
        `%${search.trim().toLowerCase()}%`,
      ),
    ];
  }
  return Player.findAll({ where, order: [["fullName", "ASC"]] });
}

/**
 * Overwrite a single section inside Player.extendedProfile, leaving every
 * other section untouched.
 */
async function updateExtendedSection(userId, section, data) {
  const player = await findByUserId(userId);
  if (!player) return null;
  const current = player.extendedProfile || {};
  const next = { ...current, [section]: data };
  await player.update({ extendedProfile: next });
  player.changed("extendedProfile", true);
  return player;
}

async function recalculateSnapshotFromMatchStats(userId) {
  const player = await findByUserId(userId);
  if (!player) return null;

  const result = await PlayerMatchStat.findOne({
    where: { playerId: player.id },
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("id")), "matches"],
      [sequelize.fn("SUM", sequelize.col("runs")), "totalRuns"],
      [sequelize.fn("SUM", sequelize.col("ballsFaced")), "totalBallsFaced"],
      [sequelize.fn("SUM", sequelize.col("wickets")), "totalWickets"],
    ],
    raw: true,
  });

  const matches = Number(result?.matches) || 0;
  const totalRuns = Number(result?.totalRuns) || 0;
  const totalBallsFaced = Number(result?.totalBallsFaced) || 0;
  const totalWickets = Number(result?.totalWickets) || 0;

  await player.update({
    careerMatches: matches,
    careerRuns: totalRuns,
    careerWickets: totalWickets,
    careerAverage: matches > 0 ? Number((totalRuns / matches).toFixed(2)) : 0,
    careerStrikeRate:
      totalBallsFaced > 0
        ? Number(((totalRuns / totalBallsFaced) * 100).toFixed(2))
        : 0,
  });

  return player;
}

/**
 * Last `limit` innings for the Performance tab's form chart + match-by-match
 * table, oldest first (so the chart reads left-to-right chronologically).
 */
async function getRecentMatchStats(playerId, limit = 10) {
  const rows = await PlayerMatchStat.findAll({
    where: { playerId },
    include: [
      {
        model: Match,
        include: [
          { model: Team, as: "teamA" },
          { model: Team, as: "teamB" },
        ],
      },
    ],
    order: [[Match, "matchDate", "DESC"]],
    limit,
  });
  return rows.reverse();
}

/** All strength/weakness tags for the Strengths & Weaknesses tab. */
async function getPlayerTags(playerId) {
  return PlayerTag.findAll({
    where: { playerId },
    include: [{ model: Tag }],
    order: [["createdAt", "DESC"]],
  });
}

/** Every attitude rating on record for this player (averaged in the service layer). */
async function getAttitudeRatings(playerId) {
  return AttitudeRating.findAll({ where: { playerId } });
}

/** Tagged video clips for the Video Library tab. */
async function getVideoClips(playerId) {
  return VideoClip.findAll({
    where: { playerId },
    order: [["createdAt", "DESC"]],
  });
}

module.exports = {
  findByUserId,
  findById,
  createForUser,
  createPlayer,
  updateByUserId,
  updateById,
  updateExtendedSection,
  assignTeam,
  getCurrentTeam,
  listAll,
  recalculateSnapshotFromMatchStats,
  getRecentMatchStats,
  getPlayerTags,
  getAttitudeRatings,
  getVideoClips,
};
