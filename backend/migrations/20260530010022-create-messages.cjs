"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Conversations",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ""
      },

      mediaUrl: {
        type: Sequelize.STRING(2048),
        allowNull: true
      },

      isRecalled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      type: {
        type: Sequelize.ENUM("TEXT", "IMAGE", "FILE"),
        allowNull: false,
        defaultValue: "TEXT"
      },

      replyToId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Messages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
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
    await queryInterface.dropTable("Messages");
  },
};
