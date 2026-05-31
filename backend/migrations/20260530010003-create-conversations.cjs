"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Conversations", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      conversationName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      avatar: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        defaultValue: "https://res.cloudinary.com/dyjqsqkir/image/upload/v1757343301/istockphoto-1337144146-612x612_blyh7z.jpg"
      },

      type: {
        type: Sequelize.ENUM("PRIVATE", "GROUP"),
        allowNull: false,
        defaultValue: "PRIVATE"
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
    await queryInterface.dropTable("Conversations");
  },
};
