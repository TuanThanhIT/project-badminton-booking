"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DraftBookingItems", {
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
      ALTER TABLE DraftBookingItems
      ADD CONSTRAINT check_draft_booking_items_price_non_negative
      CHECK (price >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE DraftBookingItems
      ADD CONSTRAINT check_draft_booking_items_time_range
      CHECK (startTime < endTime)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("DraftBookingItems");
  },
};
