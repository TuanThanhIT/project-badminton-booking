"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      orderStatus: {
        type: Sequelize.ENUM("PENDING", "CONFIRMED", "PREPARING", "READY_TO_SHIP", "SHIPPING", "CANCEL_REQUESTED", "CANCELLED", "RETURN_REQUESTED", "RETURNING", "RETURNED", "COMPLETED", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      previousOrderStatus: {
        type: Sequelize.ENUM("PENDING", "CONFIRMED", "PREPARING", "READY_TO_SHIP", "SHIPPING", "CANCEL_REQUESTED", "CANCELLED", "RETURN_REQUESTED", "RETURNING", "RETURNED", "COMPLETED", "FAILED"),
        allowNull: true
      },

      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      shippingFee: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },

      shippingName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      shippingPhone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      shippingAddress: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      shippingDistrictId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      shippingWardCode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      shippingWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      shippingServiceId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      shippingFeeReal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },

      shippingStatus: {
        type: Sequelize.ENUM("PENDING", "CREATED", "PICKING", "PICKED", "IN_TRANSIT", "DELIVERING", "DELIVERED", "FAILED", "RETURNING", "RETURNED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING"
      },

      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      trackingCode: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      shippingOrderCode: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      estimatedDelivery: {
        type: Sequelize.DATE,
        allowNull: true
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

      orderGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "OrderGroups",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      cancelledBy: {
        type: Sequelize.ENUM("USER", "EMPLOYEE", "SYSTEM"),
        allowNull: true
      },

      cancelReason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      cancelRequestedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancelHandledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancelRejectReason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      returnReason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      returnRequestedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      returnHandledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },

      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
      ALTER TABLE Orders
      ADD CONSTRAINT check_orders_subtotal_non_negative
      CHECK (subtotal >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT check_orders_shipping_fee_non_negative
      CHECK (shippingFee >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT check_orders_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT check_orders_shipping_weight_positive
      CHECK (shippingWeight > 0)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT check_orders_shipping_fee_real_non_negative
      CHECK (shippingFeeReal IS NULL OR shippingFeeReal >= 0)
    `);
    await queryInterface.addIndex("Orders", ["orderGroupId"], {
      name: "orders_order_group_id"
    });

    await queryInterface.addIndex("Orders", ["branchId"], {
      name: "orders_branch_id"
    });

    await queryInterface.addIndex("Orders", ["trackingCode"], {
      name: "orders_tracking_code"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Orders");
  },
};
