"use strict";

const {
  seedAdminWinbackCustomers,
  downAdminWinbackCustomers,
} = require("./helpers/admin-winback-seed.cjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const result = await seedAdminWinbackCustomers(queryInterface, Sequelize);
    console.log("[AI-WINBACK] Done:", JSON.stringify(result, null, 2));
  },

  async down(queryInterface, Sequelize) {
    await downAdminWinbackCustomers(queryInterface, Sequelize);
    console.log("[AI-WINBACK] Rolled back.");
  },
};
