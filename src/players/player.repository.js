"use strict";

const {
  Player,
  PlayerMatchStat,
  sequelize,
  User,
} = require("../database/models");

async function findByUserId(userId) {
  return Player.findOne({ where: { userId } });
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
];

async function updateByUserId(userId, fields) {
  const player = await findByUserId(userId);
  if (!player) return null;

  const updates = {};
  for (const key of [...EDITABLE_HERO_FIELDS, ...EDITABLE_SNAPSHOT_FIELDS]) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      updates[key] = fields[key];
    }
  }

  await player.update(updates);
  return player;
}

/**
 * Overwrite a single section inside Player.extendedProfile, leaving every
 * other section untouched. `data` can be an array (list sections) or a
 * plain object (record sections) — stored as-is.
 */
async function updateExtendedSection(userId, section, data) {
  const player = await findByUserId(userId);
  if (!player) return null;

  const current = player.extendedProfile || {};
  const next = { ...current, [section]: data };

  // JSON columns need an explicit changed() flag in some Sequelize/dialect
  // combos since the reference itself is new but Sequelize can't always
  // diff nested JSON automatically.
  await player.update({ extendedProfile: next });
  player.changed("extendedProfile", true);

  return player;
}

/**
 * Recompute career-snapshot fields from PlayerMatchStat and overwrite the
 * cache on Player. Used by an optional "Recalculate from match data" action
 * once a player has real per-match rows — not called automatically.
 */
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

module.exports = {
  findByUserId,
  createForUser,
  updateByUserId,
  updateExtendedSection,
  recalculateSnapshotFromMatchStats,
};
