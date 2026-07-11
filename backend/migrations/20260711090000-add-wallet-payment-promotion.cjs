"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Discounts", "campaignKey", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });

    await queryInterface.addColumn("Discounts", "applicationMode", {
      type: Sequelize.ENUM("CODE", "AUTOMATIC"),
      allowNull: false,
      defaultValue: "CODE",
    });

    await queryInterface.addColumn("Discounts", "requiredPaymentMethod", {
      type: Sequelize.ENUM("COD", "CASH", "VNPAY", "BANK", "WALLET"),
      allowNull: true,
    });

    await queryInterface.addColumn("Discounts", "usageLimitPerUser", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Discounts", "usageLimitPeriod", {
      type: Sequelize.ENUM("MONTHLY"),
      allowNull: true,
    });

    await queryInterface.addColumn("Discounts", "allowStacking", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addIndex("Discounts", ["campaignKey"], {
      unique: true,
      name: "uniq_discounts_campaign_key",
    });

    await queryInterface.createTable("DiscountUsages", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      discountId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Discounts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      referenceType: {
        type: Sequelize.ENUM("ORDER", "BOOKING"),
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      discountAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "USED", "RESTORED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      restoredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("DiscountUsages", {
      fields: ["discountId", "referenceType", "referenceId"],
      type: "unique",
      name: "uniq_discount_usage_reference",
    });

    await queryInterface.addIndex(
      "DiscountUsages",
      ["userId", "discountId", "usedAt", "status"],
      { name: "idx_discount_usages_monthly_count" },
    );

    await queryInterface.addColumn("OrderGroups", "walletDiscountId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Discounts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("OrderGroups", "walletDiscountAmount", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Bookings", "walletDiscountId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Discounts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Bookings", "walletDiscountAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Bookings", "walletDiscountAmount");
    await queryInterface.removeColumn("Bookings", "walletDiscountId");
    await queryInterface.removeColumn("OrderGroups", "walletDiscountAmount");
    await queryInterface.removeColumn("OrderGroups", "walletDiscountId");

    await queryInterface.removeIndex(
      "DiscountUsages",
      "idx_discount_usages_monthly_count",
    );
    await queryInterface.dropTable("DiscountUsages");

    await queryInterface.removeIndex("Discounts", "uniq_discounts_campaign_key");
    await queryInterface.removeColumn("Discounts", "allowStacking");
    await queryInterface.removeColumn("Discounts", "usageLimitPeriod");
    await queryInterface.removeColumn("Discounts", "usageLimitPerUser");
    await queryInterface.removeColumn("Discounts", "requiredPaymentMethod");
    await queryInterface.removeColumn("Discounts", "applicationMode");
    await queryInterface.removeColumn("Discounts", "campaignKey");
  },
};
