"use strict";

const { seedWalletAddress, downWalletAddress } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedWalletAddress(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downWalletAddress(queryInterface, Sequelize);
  },
};
