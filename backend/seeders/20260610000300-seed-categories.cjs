"use strict";

const { seedCategories, downCategories } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCategories(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCategories(queryInterface, Sequelize);
  },
};
