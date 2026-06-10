"use strict";

const { seedBranchManagers, downBranchManagers } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBranchManagers(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBranchManagers(queryInterface, Sequelize);
  },
};
