"use strict";

const { seedSocial, downSocial } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedSocial(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downSocial(queryInterface, Sequelize);
  },
};
