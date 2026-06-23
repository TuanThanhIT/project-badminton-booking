"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Posts", "moderationStatus", {
      type: Sequelize.ENUM(
        "PENDING",
        "APPROVED",
        "REVIEW_REQUIRED",
        "REJECTED",
      ),
      allowNull: false,
      defaultValue: "PENDING",
    });

    await queryInterface.addColumn("Posts", "moderationLabel", {
      type: Sequelize.ENUM(
        "normal",
        "spam",
        "unauthorized_ad",
        "offensive",
      ),
      allowNull: true,
    });

    await queryInterface.addColumn("Posts", "moderationConfidence", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("Posts", "moderationAction", {
      type: Sequelize.ENUM("ALLOW", "REVIEW", "BLOCK"),
      allowNull: true,
    });

    await queryInterface.addColumn("Posts", "moderationReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Posts", "moderationText", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Posts", "moderatedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex(
      "Posts",
      ["moderationStatus", "createdAt"],
      { name: "idx_posts_moderation_status_created_at" },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "Posts",
      "idx_posts_moderation_status_created_at",
    );
    await queryInterface.removeColumn("Posts", "moderatedAt");
    await queryInterface.removeColumn("Posts", "moderationText");
    await queryInterface.removeColumn("Posts", "moderationReason");
    await queryInterface.removeColumn("Posts", "moderationAction");
    await queryInterface.removeColumn("Posts", "moderationConfidence");
    await queryInterface.removeColumn("Posts", "moderationLabel");
    await queryInterface.removeColumn("Posts", "moderationStatus");
  },
};
