"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationParticipants", {
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Conversations",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      role: {
        type: Sequelize.ENUM("ADMIN", "MEMBER"),
        allowNull: false,
        defaultValue: "ADMIN"
      },

      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      lastReadAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addIndex("ConversationParticipants", ["conversationId","userId"], {
      unique: true,
      name: "conversation_participants_conversation_id_user_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ConversationParticipants");
  },
};
