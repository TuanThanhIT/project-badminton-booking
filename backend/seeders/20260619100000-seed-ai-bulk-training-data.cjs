"use strict";

const {
  seedAiBulkTrainingData,
  downAiBulkTrainingData,
} = require("./helpers/ai-bulk-seed.cjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const result = await seedAiBulkTrainingData(queryInterface, Sequelize);
    console.log("[AI-BULK-TRAIN] Done:", JSON.stringify(result, null, 2));
  },

  async down(queryInterface, Sequelize) {
    await downAiBulkTrainingData(queryInterface, Sequelize);
    console.log("[AI-BULK-TRAIN] Rolled back.");
  },
};
