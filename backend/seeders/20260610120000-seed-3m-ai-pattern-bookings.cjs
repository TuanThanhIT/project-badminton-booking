"use strict";

const {
  seedAiPatternBookings,
  downAiPatternBookings,
} = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedAiPatternBookings(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downAiPatternBookings(queryInterface, Sequelize);
  },
};
