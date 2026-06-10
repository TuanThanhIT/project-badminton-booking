"use strict";

const { seedWorkShifts, downWorkShifts } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedWorkShifts(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downWorkShifts(queryInterface, Sequelize);
  },
};
