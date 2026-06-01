"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DraftBookings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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

      nameCustomer: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: ""
      },

      note: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      draftBookingStatus: {
        type: Sequelize.ENUM("DRAFT", "COMPLETED", "CANCELLED"),
        allowNull: false,
        defaultValue: "DRAFT"
      },

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
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
      ALTER TABLE DraftBookings
      ADD CONSTRAINT check_draft_bookings_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("DraftBookings");
  },
};
