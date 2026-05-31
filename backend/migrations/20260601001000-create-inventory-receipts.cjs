"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("InventoryReceipts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      managerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      variantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProductVariants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      sellingPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },

      importPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },

      totalAmount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },

      previousStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      newStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      note: {
        type: Sequelize.STRING(500),
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

    await queryInterface.addIndex("InventoryReceipts", ["branchId", "createdAt"], {
      name: "inventory_receipts_branch_id_created_at",
    });
    await queryInterface.addIndex("InventoryReceipts", ["managerId"], {
      name: "inventory_receipts_manager_id",
    });
    await queryInterface.addIndex("InventoryReceipts", ["productId"], {
      name: "inventory_receipts_product_id",
    });
    await queryInterface.addIndex("InventoryReceipts", ["variantId"], {
      name: "inventory_receipts_variant_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("InventoryReceipts");
  },
};
