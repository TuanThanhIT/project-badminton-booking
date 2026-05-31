import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ quiet: true });

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME.trim(),
});

try {
  const [columns] = await connection.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'BranchManagers'
    `,
  );
  const existingColumns = new Set(columns.map(({ COLUMN_NAME }) => COLUMN_NAME));

  if (!existingColumns.has("id")) {
    await connection.query(
      "ALTER TABLE BranchManagers ADD COLUMN id INT NOT NULL AUTO_INCREMENT UNIQUE FIRST",
    );
    console.log("Added BranchManagers.id");
  } else {
    console.log("BranchManagers.id already exists");
  }

  const missingColumns = [
    [
      "isActive",
      "ALTER TABLE BranchManagers ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1 AFTER managerId",
    ],
    [
      "revokedDate",
      "ALTER TABLE BranchManagers ADD COLUMN revokedDate DATETIME NULL DEFAULT NULL AFTER isActive",
    ],
    [
      "note",
      "ALTER TABLE BranchManagers ADD COLUMN note VARCHAR(500) NULL DEFAULT NULL AFTER revokedDate",
    ],
    [
      "assignedDate",
      "ALTER TABLE BranchManagers ADD COLUMN assignedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER note",
    ],
    [
      "updatedDate",
      "ALTER TABLE BranchManagers ADD COLUMN updatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER assignedDate",
    ],
  ];

  for (const [columnName, alterSql] of missingColumns) {
    if (!existingColumns.has(columnName)) {
      await connection.query(alterSql);
      console.log(`Added BranchManagers.${columnName}`);
    } else {
      console.log(`BranchManagers.${columnName} already exists`);
    }
  }

  const [branchManagerColumns] = await connection.query(
    "SHOW COLUMNS FROM BranchManagers",
  );
  console.table(
    branchManagerColumns.map(({ Field, Type, Null, Key, Default }) => ({
      Field,
      Type,
      Null,
      Key,
      Default,
    })),
  );
} finally {
  await connection.end();
}
