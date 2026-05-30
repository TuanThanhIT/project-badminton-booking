"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
    await queryInterface.dropTable("Users");
  },
};
