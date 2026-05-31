"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WithdrawRequests", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      walletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Wallets",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },

      bankName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      bankAccount: {
        type: Sequelize.STRING(50),
        allowNull: false
      },

      accountHolder: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM("PENDING", "CONFIRMED", "SUCCESS", "FAILED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE WithdrawRequests
      ADD CONSTRAINT check_withdraw_requests_amount_positive
      CHECK (amount > 0)
    `);
    await queryInterface.addIndex("WithdrawRequests", ["walletId"], {
      name: "withdraw_requests_wallet_id"
    });

    await queryInterface.addIndex("WithdrawRequests", ["status"], {
      name: "withdraw_requests_status"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("WithdrawRequests");
  },
};
