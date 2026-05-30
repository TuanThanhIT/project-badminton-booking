"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoachProfiles", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      experienceYears: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      certificate: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      introduction: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable("CoachProfiles");
  },
};
