"use strict";

const { seedCoachProfiles, downCoachProfiles } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCoachProfiles(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCoachProfiles(queryInterface, Sequelize);
  },
};
