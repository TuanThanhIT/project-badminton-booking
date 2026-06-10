"use strict";

const { seedChatNotificationsAi, downChatNotificationsAi } = require("./helpers/demo-3m-phases.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await seedChatNotificationsAi(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await downChatNotificationsAi(queryInterface, Sequelize);
  },
};
