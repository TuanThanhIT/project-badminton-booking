"use strict";

const { seedCourtPrices, downCourtPrices } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCourtPrices(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCourtPrices(queryInterface, Sequelize);
  },
};
