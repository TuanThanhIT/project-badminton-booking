"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OfflineBookings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      draftId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "DraftBookings",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      paymentMethod: {
        type: Sequelize.ENUM("CASH", "VNPAY", "BANK"),
        allowNull: false
      },

      paymentStatus: {
        type: Sequelize.ENUM("UNPAID", "PENDING", "PAID", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      paidAt: {
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
    await queryInterface.sequelize.query(`
      ALTER TABLE OfflineBookings
      ADD CONSTRAINT check_offline_bookings_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("OfflineBookings");
  },
};
