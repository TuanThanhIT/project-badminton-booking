"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WalletTransactions", {
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

      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Payments",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      withdrawRequestId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "WithdrawRequests",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },

      type: {
        type: Sequelize.ENUM("DEPOSIT", "PAYMENT", "REFUND", "WITHDRAW"),
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      expiredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      description: {
        type: Sequelize.STRING(500),
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
    await queryInterface.sequelize.query(`
      ALTER TABLE WalletTransactions
      ADD CONSTRAINT check_wallet_transactions_amount_positive
      CHECK (amount > 0)
    `);
    await queryInterface.addIndex("WalletTransactions", ["walletId"], {
      name: "wallet_transactions_wallet_id"
    });

    await queryInterface.addIndex("WalletTransactions", ["paymentId"], {
      name: "wallet_transactions_payment_id"
    });

    await queryInterface.addIndex("WalletTransactions", ["status"], {
      name: "wallet_transactions_status"
    });

    await queryInterface.addIndex("WalletTransactions", ["expiredAt"], {
      name: "wallet_transactions_expired_at"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("WalletTransactions");
  },
};
