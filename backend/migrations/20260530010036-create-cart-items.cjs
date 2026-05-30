"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CartItems", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },

      subTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      cartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Carts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE CartItems
      ADD CONSTRAINT check_cart_items_quantity_positive
      CHECK (quantity > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE CartItems
      ADD CONSTRAINT check_cart_items_sub_total_non_negative
      CHECK (subTotal >= 0)
    `);
    await queryInterface.addIndex("CartItems", ["cartId","variantId"], {
      unique: true,
      name: "cart_items_cart_id_variant_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("CartItems");
  },
};
