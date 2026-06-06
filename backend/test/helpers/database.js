import { execFileSync } from "child_process";
import { Sequelize } from "sequelize";
import sequelize from "../../src/config/db.js";

const assertTestDatabase = () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing DB operation outside NODE_ENV=test.");
  }

  if (!process.env.DB_NAME?.endsWith("_test")) {
    throw new Error("Refusing DB operation because DB_NAME must end with _test.");
  }
};

export const recreateTestDatabase = async () => {
  assertTestDatabase();

  const admin = new Sequelize("mysql", process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  });

  try {
    await admin.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await admin.close();
  }
};

export const runMigrations = () => {
  assertTestDatabase();

  execFileSync(
    process.execPath,
    ["./node_modules/sequelize-cli/lib/sequelize", "db:migrate", "--env", "test"],
    {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env },
    },
  );
};

export const cleanDatabase = async () => {
  assertTestDatabase();

  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();

  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  try {
    for (const table of tables) {
      const tableName = typeof table === "string" ? table : table.tableName;
      if (tableName && tableName !== "SequelizeMeta") {
        await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
      }
    }
  } finally {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};

export const closeDatabase = async () => {
  await sequelize.close();
};
