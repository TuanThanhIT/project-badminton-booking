"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BookingDetails", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Bookings",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      monthlyBookingId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "MonthlyBookings",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      courtId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      playDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      startTime: {
        type: Sequelize.TIME,
        allowNull: false
      },

      endTime: {
        type: Sequelize.TIME,
        allowNull: false
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE BookingDetails
      ADD CONSTRAINT check_booking_details_price_non_negative
      CHECK (price >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE BookingDetails
      ADD CONSTRAINT check_booking_details_time_range
      CHECK (startTime < endTime)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BookingDetails");
  },
};
