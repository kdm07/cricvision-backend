"use strict";

const { PlayerTag, Tag } = require("../database/models");

async function listByPlayerAndCategory(playerId, category) {
  return PlayerTag.findAll({
    where: { playerId },
    include: [{ model: Tag, where: { category }, required: true }],
    order: [["createdAt", "DESC"]],
  });
}

async function addTag(playerId, enteredById, { label, category, notes }) {
  const [tag] = await Tag.findOrCreate({
    where: { label },
    defaults: { category },
  });
  return PlayerTag.create({
    playerId,
    tagId: tag.id,
    enteredById,
    notes: notes ?? null,
  });
}

async function removeTag(playerTagId, playerId) {
  const deleted = await PlayerTag.destroy({
    where: { id: playerTagId, playerId },
  });
  return deleted > 0;
}

module.exports = { listByPlayerAndCategory, addTag, removeTag };
