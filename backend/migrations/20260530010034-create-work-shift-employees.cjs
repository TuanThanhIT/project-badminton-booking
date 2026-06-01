"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WorkShiftEmployees", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      workShiftId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "WorkShifts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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

      roleInShift: {
        type: Sequelize.ENUM("CASHIER", "STAFF"),
        allowNull: false,
        defaultValue: "STAFF"
      },

      checkIn: {
        type: Sequelize.DATE,
        allowNull: true
      },

      checkOut: {
        type: Sequelize.DATE,
        allowNull: true
      },

      completionRate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      earnedWage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
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
      ALTER TABLE WorkShiftEmployees
      ADD CONSTRAINT check_work_shift_employees_completion_rate_range
      CHECK (completionRate >= 0 AND completionRate <= 100)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE WorkShiftEmployees
      ADD CONSTRAINT check_work_shift_employees_earned_wage_non_negative
      CHECK (earnedWage IS NULL OR earnedWage >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE WorkShiftEmployees
      ADD CONSTRAINT check_work_shift_employees_check_time_range
      CHECK (checkOut IS NULL OR checkIn IS NULL OR checkIn < checkOut)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("WorkShiftEmployees");
  },
};
