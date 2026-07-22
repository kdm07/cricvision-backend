"use strict";

const playerRepository = require("./player.repository");
const { ApiError } = require("../utils/apiError");
const { EDITABLE_SECTIONS } = require("./player.constants");
const { User } = require("../database/models");

/* ---------------------------- self-service ("me") ---------------------------- */

async function getMyProfile(userId) {
  let player = await playerRepository.findByUserId(userId);
  if (!player) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, "User not found");
    player = await playerRepository.createForUser(userId, user.fullName);
  }
  return player;
}

async function updateMyProfile(userId, fields) {
  const player = await playerRepository.updateByUserId(userId, fields);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return player;
}

async function updateMySection(userId, section, data) {
  if (!EDITABLE_SECTIONS.includes(section)) {
    throw new ApiError(400, `Unknown profile section: "${section}".`);
  }
  if (data === null || typeof data !== "object") {
    throw new ApiError(400, "Section data must be an object or an array.");
  }
  const player = await playerRepository.updateExtendedSection(
    userId,
    section,
    data,
  );
  if (!player) throw new ApiError(404, "Player profile not found.");
  return player;
}

async function recalculateMySnapshot(userId) {
  const player =
    await playerRepository.recalculateSnapshotFromMatchStats(userId);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return player;
}

/* ------------------------- admin/staff (Players directory) ------------------------- */

async function listPlayers(search) {
  const players = await playerRepository.listAll({ search });
  return Promise.all(
    players.map(async (player) => ({
      player,
      team: await playerRepository.getCurrentTeam(player.id),
    })),
  );
}

async function getPlayerById(id) {
  const player = await playerRepository.findById(id);
  if (!player) throw new ApiError(404, "Player not found.");
  const team = await playerRepository.getCurrentTeam(id);
  return { player, team };
}

async function createPlayer(fields) {
  if (!fields.fullName || !fields.fullName.trim()) {
    throw new ApiError(400, "Full name is required.");
  }
  const player = await playerRepository.createPlayer(fields);
  const team = await playerRepository.getCurrentTeam(player.id);
  return { player, team };
}

async function updatePlayerById(id, fields) {
  const player = await playerRepository.updateById(id, fields);
  if (!player) throw new ApiError(404, "Player not found.");
  const team = await playerRepository.getCurrentTeam(id);
  return { player, team };
}

function averageAttitudeField(ratings, field) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + (r[field] || 0), 0);
  return Math.round(sum / ratings.length);
}

function formatClipDuration(clip) {
  const seconds = Math.max(
    0,
    (clip.timestampEnd ?? 0) - (clip.timestampStart ?? 0),
  );
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Everything the read-only Performance / Strengths & Weaknesses / Attitude /
 * Video Library tabs need, in one call — backed by the real
 * PlayerMatchStat, PlayerTag, AttitudeRating and VideoClip tables.
 */
async function getScoutingDetail(id) {
  const player = await playerRepository.findById(id);
  if (!player) throw new ApiError(404, "Player not found.");

  const [matchStatRows, currentTeam, tagRows, attitudeRatings, clipRows] =
    await Promise.all([
      playerRepository.getRecentMatchStats(id, 10),
      playerRepository.getCurrentTeam(id),
      playerRepository.getPlayerTags(id),
      playerRepository.getAttitudeRatings(id),
      playerRepository.getVideoClips(id),
    ]);

  const recentForm = matchStatRows.map((row) => {
    const match = row.Match;
    const teamA = match?.teamA;
    const teamB = match?.teamB;
    let opponent = "Unknown";
    if (currentTeam && teamA && teamA.id === currentTeam.id)
      opponent = teamB?.name ?? "Unknown";
    else if (currentTeam && teamB && teamB.id === currentTeam.id)
      opponent = teamA?.name ?? "Unknown";
    else
      opponent =
        [teamA?.name, teamB?.name].filter(Boolean).join(" vs ") || "Unknown";

    return {
      matchDate: match?.matchDate ?? null,
      opponent,
      venue: match?.venue ?? "—",
      runs: row.runs,
      ballsFaced: row.ballsFaced,
      strikeRate: row.strikeRate,
      dismissalType: row.dismissalType ?? null,
    };
  });

  const strengths = tagRows
    .filter((t) => t.Tag?.category === "strength")
    .map((t) => ({ id: t.id, label: t.Tag.label, notes: t.notes }));
  const weaknesses = tagRows
    .filter((t) => t.Tag?.category === "weakness")
    .map((t) => ({ id: t.id, label: t.Tag.label, notes: t.notes }));

  const attitude = {
    confidence: averageAttitudeField(attitudeRatings, "confidence"),
    aggression: averageAttitudeField(attitudeRatings, "aggression"),
    discipline: averageAttitudeField(attitudeRatings, "discipline"),
    leadership: averageAttitudeField(attitudeRatings, "leadership"),
    teamwork: averageAttitudeField(attitudeRatings, "teamwork"),
    pressureHandling: averageAttitudeField(attitudeRatings, "pressureHandling"),
  };

  const videoClips = clipRows.map((clip) => ({
    id: clip.id,
    title: clip.tag ? `${clip.tag} clip` : "Tagged clip",
    tag: clip.tag ?? "Untagged",
    duration: formatClipDuration(clip),
  }));

  return { recentForm, strengths, weaknesses, attitude, videoClips };
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMySection,
  recalculateMySnapshot,
  listPlayers,
  getPlayerById,
  createPlayer,
  updatePlayerById,
  getScoutingDetail,
};
