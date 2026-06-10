"use strict";

const { seedBranches, downBranches } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBranches(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBranches(queryInterface, Sequelize);
  },
};
