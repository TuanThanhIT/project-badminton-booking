"use strict";

const { seedBookings, downBookings } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedBookings(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downBookings(queryInterface, Sequelize);
  },
};
