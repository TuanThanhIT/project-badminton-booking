"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BeverageStocks", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      beverageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Beverages",
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

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE BeverageStocks
      ADD CONSTRAINT check_beverage_stocks_stock_non_negative
      CHECK (stock >= 0)
    `);
    await queryInterface.addIndex("BeverageStocks", ["beverageId","branchId"], {
      unique: true,
      name: "beverage_stocks_beverage_id_branch_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BeverageStocks");
  },
};
