"use strict";

const { seedSystemAccounts, downSystemAccounts } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedSystemAccounts(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downSystemAccounts(queryInterface, Sequelize);
  },
};
