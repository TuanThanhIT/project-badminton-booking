"use strict";

const { seedBeverages, downBeverages } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBeverages(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBeverages(queryInterface, Sequelize);
  },
};
