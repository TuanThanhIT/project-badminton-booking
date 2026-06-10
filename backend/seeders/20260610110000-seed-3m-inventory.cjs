"use strict";

const { seedInventory, downInventory } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedInventory(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downInventory(queryInterface, Sequelize);
  },
};
