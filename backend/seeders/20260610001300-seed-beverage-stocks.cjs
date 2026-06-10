"use strict";

const { seedBeverageStocks, downBeverageStocks } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBeverageStocks(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBeverageStocks(queryInterface, Sequelize);
  },
};
