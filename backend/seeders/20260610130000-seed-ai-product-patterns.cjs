"use strict";

const {
  seedAiProductPatterns,
  downAiProductPatterns,
} = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedAiProductPatterns(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downAiProductPatterns(queryInterface, Sequelize);
  },
};
