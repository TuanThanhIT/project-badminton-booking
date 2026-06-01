"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RefreshTokens", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      expiry: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.addIndex("RefreshTokens", ["userId"], {
      name: "refresh_tokens_user_id"
    });

    await queryInterface.addIndex("RefreshTokens", ["token"], {
      name: "refresh_tokens_token"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("RefreshTokens");
  },
};
