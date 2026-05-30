"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Posts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      type: {
        type: Sequelize.ENUM("FIND_PLAYER", "TOURNAMENT", "GROUP", "FIND_COACH", "CLASS"),
        allowNull: false
      },

      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      formData: {
        type: Sequelize.JSON,
        allowNull: true
      },

      repostOfPostId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Posts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      isRepost: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      deletedAt: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Posts");
  },
};
