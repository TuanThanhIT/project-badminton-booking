"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "isOnline", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("Users", "lastSeenAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("Users", ["isOnline"], {
      name: "idx_users_is_online",
    });

    await queryInterface.addIndex("Users", ["lastSeenAt"], {
      name: "idx_users_last_seen_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Users", "idx_users_last_seen_at");
    await queryInterface.removeIndex("Users", "idx_users_is_online");
    await queryInterface.removeColumn("Users", "lastSeenAt");
    await queryInterface.removeColumn("Users", "isOnline");
  },
};
