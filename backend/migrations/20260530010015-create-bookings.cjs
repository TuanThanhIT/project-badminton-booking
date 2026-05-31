"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Bookings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      bookingStatus: {
        type: Sequelize.ENUM("PENDING", "CONFIRMED", "CHECKED_IN", "CANCEL_REQUESTED", "COMPLETED", "CANCELLED", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      previousBookingStatus: {
        type: Sequelize.ENUM("PENDING", "CONFIRMED", "CHECKED_IN", "CANCEL_REQUESTED", "COMPLETED", "CANCELLED", "FAILED"),
        allowNull: true
      },

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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

      discountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Discounts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      note: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      cancelledBy: {
        type: Sequelize.ENUM("USER", "EMPLOYEE", "SYSTEM"),
        allowNull: true
      },

      cancelReason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      cancelRejectReason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      cancelRequestedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancelHandledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancelledAt: {
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
      ALTER TABLE Bookings
      ADD CONSTRAINT check_bookings_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Bookings");
  },
};
