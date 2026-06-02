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
    const tableName = "StockTransactions";

    if (!(await tableExists(queryInterface, tableName))) {
      await queryInterface.createTable(tableName, {
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
          onDelete: "RESTRICT",
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
        type: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        beforeStock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        afterStock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        referenceType: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        referenceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        note: {
          type: Sequelize.STRING(500),
          allowNull: true,
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
        createdAt: {
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
      "stock_transactions_variant_id_fk",
    );
    await resetForeignKey(
      queryInterface,
      tableName,
      "beverageId",
      "Beverages",
      "stock_transactions_beverage_id_fk",
    );

    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_item_type",
      "itemType IN ('PRODUCT_VARIANT', 'BEVERAGE')",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_item_ref",
      `
        (itemType = 'PRODUCT_VARIANT' AND variantId IS NOT NULL AND beverageId IS NULL)
        OR
        (itemType = 'BEVERAGE' AND beverageId IS NOT NULL AND variantId IS NULL)
      `,
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_type",
      "type IN ('IMPORT', 'SALE', 'CANCEL_ORDER', 'RETURN', 'ADJUSTMENT')",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_reference_type",
      "referenceType IS NULL OR referenceType IN ('PURCHASE_RECEIPT', 'ORDER', 'ADJUSTMENT')",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_quantity_not_zero",
      "quantity <> 0",
    );
    await addCheckConstraintIfMissing(
      queryInterface,
      tableName,
      "check_stock_transactions_stock_non_negative",
      "beforeStock >= 0 AND afterStock >= 0",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["branchId", "createdAt"],
      "stock_transactions_branch_id_created_at",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["itemType", "variantId", "createdAt"],
      "stock_transactions_item_type_variant_id_created_at",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["itemType", "beverageId", "createdAt"],
      "stock_transactions_item_type_beverage_id_created_at",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["referenceType", "referenceId"],
      "stock_transactions_reference",
    );
    await addIndexIfMissing(
      queryInterface,
      tableName,
      ["createdBy", "createdAt"],
      "stock_transactions_created_by_created_at",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("StockTransactions");
  },
};
