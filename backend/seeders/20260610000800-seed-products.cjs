"use strict";

const { seedProducts, downProducts } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedProducts(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downProducts(queryInterface, Sequelize);
  },
};
