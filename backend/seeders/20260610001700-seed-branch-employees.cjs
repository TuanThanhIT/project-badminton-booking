"use strict";

const { seedBranchEmployees, downBranchEmployees } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBranchEmployees(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBranchEmployees(queryInterface, Sequelize);
  },
};
