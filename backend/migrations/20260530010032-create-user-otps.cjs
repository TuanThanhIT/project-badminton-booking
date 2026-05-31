"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserOtps", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      otpCode: {
        type: Sequelize.STRING,
        allowNull: false
      },

      otpExpiry: {
        type: Sequelize.DATE,
        allowNull: false
      },

      isUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      type: {
        type: Sequelize.ENUM("REGISTER", "RESET_PASSWORD", "WITHDRAW_REQUEST", "WALLET_PAYMENT"),
        allowNull: false
      },

      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      resetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },

      resetTokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex("UserOtps", ["userId"], {
      name: "user_otps_user_id"
    });

    await queryInterface.addIndex("UserOtps", ["resetToken"], {
      name: "user_otps_reset_token"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("UserOtps");
  },
};
