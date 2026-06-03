"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("CoachProfiles");
    if (!table.certificateImages) {
      await queryInterface.addColumn("CoachProfiles", "certificateImages", {
        type: Sequelize.JSON,
        allowNull: true,
        after: "certificate",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("CoachProfiles");
    if (table.certificateImages) {
      await queryInterface.removeColumn("CoachProfiles", "certificateImages");
    }
  },
};
