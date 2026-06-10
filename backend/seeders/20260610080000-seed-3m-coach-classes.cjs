"use strict";

const { seedCoachClasses, downCoachClasses } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedCoachClasses(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downCoachClasses(queryInterface, Sequelize);
  },
};
