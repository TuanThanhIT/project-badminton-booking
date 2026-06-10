"use strict";

const { seedProductVariants, downProductVariants } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedProductVariants(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downProductVariants(queryInterface, Sequelize);
  },
};
