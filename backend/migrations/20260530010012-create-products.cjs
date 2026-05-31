"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      productName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      brand: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      thumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },

      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
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
    await queryInterface.dropTable("Products");
  },
};
