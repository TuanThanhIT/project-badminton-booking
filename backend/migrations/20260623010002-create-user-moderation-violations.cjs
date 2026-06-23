"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserModerationViolations", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Posts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      targetType: {
        type: Sequelize.ENUM("POST", "COMMENT"),
        allowNull: false,
        defaultValue: "POST",
      },
      targetId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      label: {
        type: Sequelize.ENUM("spam", "unauthorized_ad", "offensive"),
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM("BLOCK", "REVIEW_REJECTED", "ADMIN_REJECTED"),
        allowNull: false,
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      source: {
        type: Sequelize.ENUM("AI", "ADMIN"),
        allowNull: false,
        defaultValue: "AI",
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

    await queryInterface.addIndex(
      "UserModerationViolations",
      ["userId", "createdAt"],
      { name: "idx_moderation_violations_user_created" },
    );
    await queryInterface.addIndex(
      "UserModerationViolations",
      ["postId"],
      { name: "idx_moderation_violations_post" },
    );
    await queryInterface.addIndex(
      "UserModerationViolations",
      ["targetType", "targetId"],
      { name: "idx_moderation_violations_target" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("UserModerationViolations");
  },
};
