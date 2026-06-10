"use strict";

const { seedCourts, downCourts } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCourts(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCourts(queryInterface, Sequelize);
  },
};
