"use strict";

const { seedBranchImages, downBranchImages } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBranchImages(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBranchImages(queryInterface, Sequelize);
  },
};
