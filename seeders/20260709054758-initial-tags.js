"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("Tags", [
      {
        id: uuidv4(),
        label: "Weak vs short ball",
        category: "weakness",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: "Strong cover drive",
        category: "strength",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: "Struggles under pressure",
        category: "weakness",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: "Excellent death bowling",
        category: "strength",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // add the rest of your ~30-40 tags here
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Tags", null, {});
  },
};
