"use strict";

const { seedProductImages, downProductImages } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedProductImages(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downProductImages(queryInterface, Sequelize);
  },
};
