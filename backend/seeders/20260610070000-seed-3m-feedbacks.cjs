"use strict";

const { seedFeedbacks, downFeedbacks } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedFeedbacks(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downFeedbacks(queryInterface, Sequelize);
  },
};
