"use strict";

const { seedDiscounts, downDiscounts } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedDiscounts(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downDiscounts(queryInterface, Sequelize);
  },
};
