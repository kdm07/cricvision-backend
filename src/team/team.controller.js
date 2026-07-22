"use strict";

const { Team } = require("../database/models");

async function list(req, res) {
  try {
    const teams = await Team.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.status(200).json({ teams });
  } catch (err) {
    console.error("List teams error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong, please try again" });
  }
}

module.exports = { list };
