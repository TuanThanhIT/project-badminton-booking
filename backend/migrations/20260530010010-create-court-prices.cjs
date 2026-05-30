"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CourtPrices", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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

      dayOfWeek: {
        type: Sequelize.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
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

      periodType: {
        type: Sequelize.ENUM("DAYTIME", "EVENING", "WEEKEND"),
        allowNull: false,
        defaultValue: "DAYTIME"
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE CourtPrices
      ADD CONSTRAINT check_court_prices_price_non_negative
      CHECK (price >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE CourtPrices
      ADD CONSTRAINT check_court_prices_time_range
      CHECK (startTime < endTime)
    `);
    await queryInterface.addIndex("CourtPrices", ["branchId","dayOfWeek","startTime","endTime"], {
      unique: true,
      name: "court_prices_branch_id_day_of_week_start_time_end_time"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("CourtPrices");
  },
};
