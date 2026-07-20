"use strict";

const playerTagRepository = require("./playerTag.repository");
const playerRepository = require("./player.repository");
const { ApiError } = require("../utils/apiError");

async function getMyTags(userId, category) {
  const player = await playerRepository.findByUserId(userId);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return playerTagRepository.listByPlayerAndCategory(player.id, category);
}

async function addMyTag(userId, category, { label, notes }) {
  const player = await playerRepository.findByUserId(userId);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return playerTagRepository.addTag(player.id, userId, {
    label,
    category,
    notes,
  });
}

async function removeMyTag(userId, playerTagId) {
  const player = await playerRepository.findByUserId(userId);
  if (!player) throw new ApiError(404, "Player profile not found.");
  const removed = await playerTagRepository.removeTag(playerTagId, player.id);
  if (!removed) throw new ApiError(404, "Entry not found.");
  return true;
}

module.exports = { getMyTags, addMyTag, removeMyTag };
