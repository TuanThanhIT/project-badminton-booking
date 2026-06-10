"use strict";

const { seedRoles, downRoles } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedRoles(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downRoles(queryInterface, Sequelize);
  },
};
