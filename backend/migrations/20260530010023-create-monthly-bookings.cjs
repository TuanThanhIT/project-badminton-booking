"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MonthlyBookings", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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

      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      daysOfWeek: {
        type: Sequelize.STRING,
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

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM("PENDING", "PAID", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING"
      },

      note: {
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
      ALTER TABLE MonthlyBookings
      ADD CONSTRAINT check_monthly_bookings_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("MonthlyBookings");
  },
};
