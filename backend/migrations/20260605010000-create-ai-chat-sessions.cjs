"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AiChatSessions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      guestToken: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      context: {
        type: Sequelize.ENUM("general", "booking", "shopping", "coach"),
        allowNull: false,
        defaultValue: "general",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      courtId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("AiChatSessions", ["userId", "context", "updatedAt"], {
      name: "ai_chat_sessions_user_context_updated",
    });
    await queryInterface.addIndex("AiChatSessions", ["guestToken"], {
      name: "ai_chat_sessions_guest_token",
    });

    await queryInterface.createTable("AiChatMessages", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "AiChatSessions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.ENUM("user", "assistant"),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("AiChatMessages", ["sessionId", "createdAt"], {
      name: "ai_chat_messages_session_created",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("AiChatMessages");
    await queryInterface.dropTable("AiChatSessions");
  },
};
