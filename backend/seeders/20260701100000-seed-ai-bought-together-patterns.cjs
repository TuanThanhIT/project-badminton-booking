"use strict";

const {
  seedAiBoughtTogetherPatterns,
  downAiBoughtTogetherPatterns,
} = require("./helpers/ai-bought-together-seed.cjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const result = await seedAiBoughtTogetherPatterns(queryInterface, Sequelize);
    console.log("[AI-BUNDLE-COOCUR] Done:", JSON.stringify(result, null, 2));
  },

  async down(queryInterface, Sequelize) {
    await downAiBoughtTogetherPatterns(queryInterface, Sequelize);
    console.log("[AI-BUNDLE-COOCUR] Rolled back.");
  },
};
