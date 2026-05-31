"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Profiles", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "Nguyễn Văn A"
      },

      dob: {
        type: Sequelize.DATE,
        allowNull: true
      },

      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
      },

      gender: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "male"
      },

      phoneNumber: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "0912345678"
      },

      avatar: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        defaultValue: "https://res.cloudinary.com/dyjqsqkir/image/upload/v1757343301/istockphoto-1337144146-612x612_blyh7z.jpg"
      },

      level: {
        type: Sequelize.ENUM("BEGINNER", "RECREATIONAL", "INTERMEDIATE", "ADVANCED", "COMPETITIVE"),
        allowNull: false,
        defaultValue: "BEGINNER"
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
    await queryInterface.dropTable("Profiles");
  },
};
