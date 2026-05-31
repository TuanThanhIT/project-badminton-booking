"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      paymentAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },

      paymentMethod: {
        type: Sequelize.ENUM("COD", "CASH", "VNPAY", "BANK", "WALLET"),
        allowNull: true
      },

      paymentStatus: {
        type: Sequelize.ENUM("UNPAID", "PENDING", "PAID", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      transId: {
        type: Sequelize.STRING,
        allowNull: true
      },

      externalId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },

      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      refundAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },

      refundAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      targetPaymentType: {
        type: Sequelize.ENUM("ORDER", "BOOKING", "WALLET_TOPUP"),
        allowNull: false,
        defaultValue: "ORDER"
      },

      targetPaymentId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE Payments
      ADD CONSTRAINT check_payments_payment_amount_non_negative
      CHECK (paymentAmount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Payments
      ADD CONSTRAINT check_payments_refund_amount_non_negative
      CHECK (refundAmount IS NULL OR refundAmount >= 0)
    `);
    await queryInterface.addIndex("Payments", ["targetPaymentId"], {
      name: "payments_target_payment_id"
    });

    await queryInterface.addIndex("Payments", ["externalId"], {
      name: "payments_external_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Payments");
  },
};
