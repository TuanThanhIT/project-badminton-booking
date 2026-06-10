"use strict";

const { seedCounter, downCounter } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCounter(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCounter(queryInterface, Sequelize);
  },
};
