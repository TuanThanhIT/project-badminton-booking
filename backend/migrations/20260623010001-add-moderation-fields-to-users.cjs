"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "accountStatus", {
      type: Sequelize.ENUM("ACTIVE", "WARNING", "SUSPENDED", "BANNED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    });

    await queryInterface.addColumn("Users", "suspendedUntil", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "suspensionReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "violationCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Users", "lastViolationAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("Users", ["accountStatus"], {
      name: "idx_users_account_status",
    });
    await queryInterface.addIndex("Users", ["lastViolationAt"], {
      name: "idx_users_last_violation_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Users", "idx_users_last_violation_at");
    await queryInterface.removeIndex("Users", "idx_users_account_status");
    await queryInterface.removeColumn("Users", "lastViolationAt");
    await queryInterface.removeColumn("Users", "violationCount");
    await queryInterface.removeColumn("Users", "suspensionReason");
    await queryInterface.removeColumn("Users", "suspendedUntil");
    await queryInterface.removeColumn("Users", "accountStatus");
  },
};
