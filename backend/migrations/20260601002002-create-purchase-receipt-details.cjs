"use strict";

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) => {
    const name = typeof table === "object" ? table.tableName || table.name : table;
    return name === tableName;
  });
};

const constraintExists = async (queryInterface, tableName, constraintName) => {
  const [rows] = await queryInterface.sequelize.query(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
    `,
    { replacements: [tableName, constraintName] },
  );

  return rows.length > 0;
};

const addCheckConstraintIfMissing = async (
  queryInterface,
  tableName,
  constraintName,
  expression,
) => {
  if (await constraintExists(queryInterface, tableName, constraintName)) {
    return;
  }

  await queryInterface.sequelize.query(`
    ALTER TABLE ${tableName}
    ADD CONSTRAINT ${constraintName}
    CHECK (${expression})
  `);
};

const addIndexIfMissing = async (queryInterface, tableName, fields, name) => {
  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some((index) => index.name === name)) {
    return;
  }

  await queryInterface.addIndex(tableName, fields, { name });
};

const resetForeignKey = async (
  queryInterface,
  tableName,
  columnName,
  referencedTable,
  constraintName,
) => {
  const [foreignKeys] = await queryInterface.sequelize.query(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `,
    { replacements: [tableName, columnName] },
  );

  for (const foreignKey of foreignKeys) {
    await queryInterface.sequelize.query(
      `ALTER TABLE ${tableName} DROP FOREIGN KEY ${foreignKey.CONSTRAINT_NAME}`,
    );
  }

  await queryInterface.sequelize.query(`
    ALTER TABLE ${tableName}
    ADD CONSTRAINT ${constraintName}
    FOREIGN KEY (${columnName}) REFERENCES ${referencedTable}(id)
  `);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "PurchaseReceiptDetails";

    if (!(await tableExists(queryInterface, tableName))) {
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        purchaseReceiptId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "PurchaseReceipts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        itemType: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        variantId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "ProductVariants",
            key: "id",
          },
        },
        beverageId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Beverages",
            key: "id",
          },
        },
        itemName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        importPrice: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        totalPrice: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
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
    }

    await resetForeignKey(
      queryInterface,
      tableName,
      "variantId",
      "ProductVariants",
      "purchase_receipt_details_variant_id_fk",
    );
    await resetForeignKey(
      queryInterface,
      tableName,
      "beverageId",
      "Beverages",
      "purchase_receipt_details_beverage_id_fk",
    );

    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_purchase_receipt_details_item_type",
      "itemType IN ('PRODUCT_VARIANT', 'BEVERAGE')",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_purchase_receipt_details_item_ref",
      `
        (itemType = 'PRODUCT_VARIANT' AND variantId IS NOT NULL AND beverageId IS NULL)
        OR
        (itemType = 'BEVERAGE' AND beverageId IS NOT NULL AND variantId IS NULL)
      `,
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_purchase_receipt_details_quantity_positive",
      "quantity > 0",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_purchase_receipt_details_import_price_non_negative",
      "importPrice >= 0",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_purchase_receipt_details_total_price_non_negative",
      "totalPrice >= 0",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["purchaseReceiptId"],
      "purchase_receipt_details_receipt_id",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["itemType", "variantId"],
      "purchase_receipt_details_item_type_variant_id",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["itemType", "beverageId"],
      "purchase_receipt_details_item_type_beverage_id",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PurchaseReceiptDetails");
  },
};
