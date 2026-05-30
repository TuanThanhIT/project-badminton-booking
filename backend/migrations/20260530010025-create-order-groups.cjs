"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderGroups", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      totalShippingFee: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      discountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Discounts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      discountAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },

      isDiscountApplied: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      finalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      status: {
        type: Sequelize.ENUM("PENDING_PAYMENT", "PAID", "FAILED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING_PAYMENT"
      },

      note: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
      ALTER TABLE OrderGroups
      ADD CONSTRAINT check_order_groups_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE OrderGroups
      ADD CONSTRAINT check_order_groups_total_shipping_fee_non_negative
      CHECK (totalShippingFee >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE OrderGroups
      ADD CONSTRAINT check_order_groups_discount_amount_non_negative
      CHECK (discountAmount IS NULL OR discountAmount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE OrderGroups
      ADD CONSTRAINT check_order_groups_final_amount_non_negative
      CHECK (finalAmount >= 0)
    `);
    await queryInterface.addIndex("OrderGroups", ["userId"], {
      name: "order_groups_user_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("OrderGroups");
  },
};
