"use strict";

const { seedOrders, downOrders } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedOrders(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downOrders(queryInterface, Sequelize);
  },
};
