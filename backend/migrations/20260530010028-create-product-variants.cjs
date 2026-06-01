"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProductVariants", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      sku: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      discount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      color: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      size: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      material: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.5
      },

      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE ProductVariants
      ADD CONSTRAINT check_product_variants_price_non_negative
      CHECK (price >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ProductVariants
      ADD CONSTRAINT check_product_variants_discount_range
      CHECK (discount IS NULL OR (discount >= 0 AND discount <= 100))
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ProductVariants
      ADD CONSTRAINT check_product_variants_weight_positive
      CHECK (weight > 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ProductVariants");
  },
};
