"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("VariantStocks", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      variantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProductVariants",
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
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE VariantStocks
      ADD CONSTRAINT check_variant_stocks_stock_non_negative
      CHECK (stock >= 0)
    `);
    await queryInterface.addIndex("VariantStocks", ["variantId","branchId"], {
      unique: true,
      name: "variant_stocks_variant_id_branch_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("VariantStocks");
  },
};
