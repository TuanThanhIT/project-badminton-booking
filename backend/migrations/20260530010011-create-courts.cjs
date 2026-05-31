"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Courts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      courtName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      thumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },

      courtStatus: {
        type: Sequelize.ENUM("ACTIVE", "MAINTENANCE", "CLOSED"),
        allowNull: false,
        defaultValue: "ACTIVE"
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Courts");
  },
};
