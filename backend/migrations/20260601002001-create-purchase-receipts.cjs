"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PurchaseReceipts", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      receiptCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      totalAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      note: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      approvedAt: {
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

    await queryInterface.sequelize.query(`
      ALTER TABLE PurchaseReceipts
      ADD CONSTRAINT check_purchase_receipts_status
      CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE PurchaseReceipts
      ADD CONSTRAINT check_purchase_receipts_total_amount_non_negative
      CHECK (totalAmount >= 0)
    `);
    await queryInterface.addIndex("PurchaseReceipts", ["receiptCode"], {
      name: "purchase_receipts_receipt_code",
    });
    await queryInterface.addIndex("PurchaseReceipts", ["branchId", "status"], {
      name: "purchase_receipts_branch_id_status",
    });
    await queryInterface.addIndex("PurchaseReceipts", ["supplierId"], {
      name: "purchase_receipts_supplier_id",
    });
    await queryInterface.addIndex("PurchaseReceipts", ["createdBy"], {
      name: "purchase_receipts_created_by",
    });
    await queryInterface.addIndex("PurchaseReceipts", ["approvedBy"], {
      name: "purchase_receipts_approved_by",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PurchaseReceipts");
  },
};
