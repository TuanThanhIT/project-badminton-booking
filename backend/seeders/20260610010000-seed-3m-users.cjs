"use strict";

const { seedUsers, downUsers } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedUsers(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downUsers(queryInterface, Sequelize);
  },
};
