"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderDetails", {
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

      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      subTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },

      productName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      variantInfo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
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
      ALTER TABLE OrderDetails
      ADD CONSTRAINT check_order_details_quantity_positive
      CHECK (quantity > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE OrderDetails
      ADD CONSTRAINT check_order_details_unit_price_non_negative
      CHECK (unitPrice >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE OrderDetails
      ADD CONSTRAINT check_order_details_sub_total_non_negative
      CHECK (subTotal >= 0)
    `);
    await queryInterface.addIndex("OrderDetails", ["orderId","variantId"], {
      unique: true,
      name: "order_details_order_id_variant_id"
    });

    await queryInterface.addIndex("OrderDetails", ["orderId"], {
      name: "order_details_order_id"
    });

    await queryInterface.addIndex("OrderDetails", ["variantId"], {
      name: "order_details_variant_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("OrderDetails");
  },
};
