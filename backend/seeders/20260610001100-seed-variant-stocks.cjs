"use strict";

const { seedVariantStocks, downVariantStocks } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedVariantStocks(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downVariantStocks(queryInterface, Sequelize);
  },
};
