"use strict";

const playerTagService = require("./playerTag.service");
const { ApiError } = require("../utils/apiError");

function respondWithError(res, err, fallbackMessage) {
  if (err instanceof ApiError)
    return res.status(err.statusCode).json({ error: err.message });
  console.error(fallbackMessage, err);
  return res
    .status(500)
    .json({ error: "Something went wrong, please try again" });
}

function serialize(playerTag) {
  return {
    id: playerTag.id,
    label: playerTag.Tag.label,
    notes: playerTag.notes,
    createdAt: playerTag.createdAt,
  };
}

async function list(req, res) {
  try {
    const category = req.params.category; // "strength" | "weakness"
    const tags = await playerTagService.getMyTags(req.user.id, category);
    return res.status(200).json({ tags: tags.map(serialize) });
  } catch (err) {
    return respondWithError(res, err, "List player tags error:");
  }
}

async function create(req, res) {
  try {
    const category = req.params.category;
    const tag = await playerTagService.addMyTag(
      req.user.id,
      category,
      req.body,
    );
    return res.status(201).json({ tag: serialize(tag) });
  } catch (err) {
    return respondWithError(res, err, "Create player tag error:");
  }
}

async function remove(req, res) {
  try {
    await playerTagService.removeMyTag(req.user.id, req.params.id);
    return res.status(200).json({ success: true });
  } catch (err) {
    return respondWithError(res, err, "Delete player tag error:");
  }
}

module.exports = { list, create, remove };
