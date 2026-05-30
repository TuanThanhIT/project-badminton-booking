"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CashRegisters", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      workShiftEmployeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "WorkShiftEmployees",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      openingCash: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      closingCash: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      expectedCash: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      difference: {
        type: Sequelize.DECIMAL(10, 2),
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
      ALTER TABLE CashRegisters
      ADD CONSTRAINT check_cash_registers_opening_cash_non_negative
      CHECK (openingCash >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE CashRegisters
      ADD CONSTRAINT check_cash_registers_closing_cash_non_negative
      CHECK (closingCash >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE CashRegisters
      ADD CONSTRAINT check_cash_registers_expected_cash_non_negative
      CHECK (expectedCash >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("CashRegisters");
  },
};
