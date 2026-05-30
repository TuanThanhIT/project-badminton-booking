"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WorkShifts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      shiftName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      workDate: {
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

      cashierShiftWage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      staffShiftWage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
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

      shiftStatus: {
        type: Sequelize.ENUM("SCHEDULED", "INPROGRESS", "COMPLETED", "CANCELLED"),
        allowNull: false,
        defaultValue: "SCHEDULED"
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
      ALTER TABLE WorkShifts
      ADD CONSTRAINT check_work_shifts_time_range
      CHECK (startTime < endTime)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE WorkShifts
      ADD CONSTRAINT check_work_shifts_cashier_wage_non_negative
      CHECK (cashierShiftWage >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE WorkShifts
      ADD CONSTRAINT check_work_shifts_staff_wage_non_negative
      CHECK (staffShiftWage >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("WorkShifts");
  },
};
