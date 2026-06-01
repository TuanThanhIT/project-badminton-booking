"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderShippingLogs", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION"
      },

      status: {
        type: Sequelize.ENUM("PENDING", "CREATED", "PICKING", "PICKED", "IN_TRANSIT", "DELIVERING", "DELIVERED", "FAILED", "RETURNING", "RETURNED", "CANCELLED"),
        allowNull: false
      },

      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      eventTime: {
        type: Sequelize.DATE,
        allowNull: true
      },

      rawData: {
        type: Sequelize.JSON,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    await queryInterface.addIndex("OrderShippingLogs", ["orderId"], {
      name: "order_shipping_logs_order_id"
    });

    await queryInterface.addIndex("OrderShippingLogs", ["status"], {
      name: "order_shipping_logs_status"
    });

    await queryInterface.addIndex("OrderShippingLogs", ["createdAt"], {
      name: "order_shipping_logs_created_at"
    });

    await queryInterface.addIndex("OrderShippingLogs", ["orderId","status","eventTime"], {
      unique: true,
      name: "order_shipping_logs_order_id_status_event_time"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("OrderShippingLogs");
  },
};
