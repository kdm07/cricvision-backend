"use strict";

const playerRepository = require("./player.repository");
const { ApiError } = require("../utils/apiError");
const {
  User,
} = require("../database/models");

// async function getMyProfile(userId, fullNameFallback) {
//   let player = await playerRepository.findByUserId(userId);
//   console.log
//   if (!player) {
//     player = await playerRepository.createForUser(userId, fullNameFallback);
//   }
//   return player;
// }

async function getMyProfile(userId) {
  let player = await playerRepository.findByUserId(userId);

  if (!player) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    player = await playerRepository.createForUser(
      userId,
      user.fullName, // or user.name
    );
  }

  console.log("Player profile retrieved or created:", player);

  return player;
}


async function updateMyProfile(userId, fields) {
  const player = await playerRepository.updateByUserId(userId, fields);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return player;
}

async function recalculateMySnapshot(userId) {
  const player =
    await playerRepository.recalculateSnapshotFromMatchStats(userId);
  if (!player) throw new ApiError(404, "Player profile not found.");
  return player;
}

module.exports = { getMyProfile, updateMyProfile, recalculateMySnapshot };
