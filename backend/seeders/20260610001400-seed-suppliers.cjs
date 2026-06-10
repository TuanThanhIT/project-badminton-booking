"use strict";

const { seedSuppliers, downSuppliers } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedSuppliers(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downSuppliers(queryInterface, Sequelize);
  },
};
