"use strict";

const {
  seedAdminOccupancySkew,
  downAdminOccupancySkew,
} = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedAdminOccupancySkew(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downAdminOccupancySkew(queryInterface, Sequelize);
  },
};
