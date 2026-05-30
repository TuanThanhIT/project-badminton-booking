"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Beverages", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      beverageName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      thumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      stock: {
        type: Sequelize.INTEGER,
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
      ALTER TABLE Beverages
      ADD CONSTRAINT check_beverages_price_non_negative
      CHECK (price >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Beverages
      ADD CONSTRAINT check_beverages_stock_non_negative
      CHECK (stock >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Beverages");
  },
};
