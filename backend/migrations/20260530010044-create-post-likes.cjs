"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PostLikes", {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
          model: "Posts",
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
    await queryInterface.addIndex("PostLikes", ["userId","postId"], {
      unique: true,
      name: "post_likes_user_id_post_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PostLikes");
  },
};
