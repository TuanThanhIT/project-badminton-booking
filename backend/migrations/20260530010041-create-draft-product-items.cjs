"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DraftProductItems", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      draftId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "DraftBookings",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      productVariantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProductVariants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
      ALTER TABLE DraftProductItems
      ADD CONSTRAINT check_draft_product_items_quantity_positive
      CHECK (quantity > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE DraftProductItems
      ADD CONSTRAINT check_draft_product_items_sub_total_non_negative
      CHECK (subTotal >= 0)
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("DraftProductItems");
  },
};
