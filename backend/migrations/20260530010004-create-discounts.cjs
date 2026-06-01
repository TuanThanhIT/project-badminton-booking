"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Discounts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },

      type: {
        type: Sequelize.ENUM("AMOUNT", "PERCENT"),
        allowNull: false,
        defaultValue: "AMOUNT"
      },

      applyType: {
        type: Sequelize.ENUM("ORDER", "BOOKING", "ALL"),
        allowNull: false,
        defaultValue: "ALL"
      },

      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      maxDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },

      minAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      usageLimit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      endDate: {
        type: Sequelize.DATEONLY,
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
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_value_positive
      CHECK (value > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_percent_value_range
      CHECK (type <> 'PERCENT' OR value <= 100)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_max_discount_non_negative
      CHECK (maxDiscount IS NULL OR maxDiscount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_min_amount_non_negative
      CHECK (minAmount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_usage_limit_positive
      CHECK (usageLimit IS NULL OR usageLimit > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_usage_count_non_negative
      CHECK (usageCount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_date_range
      CHECK (startDate < endDate)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Discounts");
  },
};
