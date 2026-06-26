"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Discounts", "visibility", {
      type: Sequelize.ENUM("PUBLIC", "PRIVATE"),
      allowNull: false,
      defaultValue: "PUBLIC",
    });

    await queryInterface.addColumn("Discounts", "branchId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Branches", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Discounts", "startHour", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Discounts", "endHour", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts
      ADD CONSTRAINT check_discounts_hour_range
      CHECK (startHour IS NULL OR endHour IS NULL OR endHour > startHour)
    `);

    await queryInterface.createTable("DiscountUsers", {
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
      isUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usedAt: {
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

    await queryInterface.addConstraint("DiscountUsers", {
      fields: ["discountId", "userId"],
      type: "unique",
      name: "uniq_discount_user",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("DiscountUsers");

    await queryInterface.sequelize.query(`
      ALTER TABLE Discounts DROP CONSTRAINT check_discounts_hour_range
    `);
    await queryInterface.removeColumn("Discounts", "endHour");
    await queryInterface.removeColumn("Discounts", "startHour");
    await queryInterface.removeColumn("Discounts", "branchId");
    await queryInterface.removeColumn("Discounts", "visibility");
  },
};
