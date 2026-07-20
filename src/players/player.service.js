"use strict";

const playerRepository = require("./player.repository");
const { ApiError } = require("../utils/apiError");
const { EDITABLE_SECTIONS } = require("./player.constants");
const { User } = require("../database/models");

async function getMyProfile(userId) {
  let player = await playerRepository.findByUserId(userId);

  if (!player) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMySection,
  recalculateMySnapshot,
};
