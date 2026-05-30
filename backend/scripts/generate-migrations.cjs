"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const migrationsDir = path.join(rootDir, "migrations");
const modelsIndex = path.join(rootDir, "src", "models", "index.js");

const ignoredTables = new Set(["SequelizeMeta"]);

const scalar = (value) => {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  return JSON.stringify(value);
};

const renderDataType = (type) => {
  const key = type?.key || type?.constructor?.key;
  const options = type?.options || {};

  if (key === "STRING") {
    return options.length ? `Sequelize.STRING(${options.length})` : "Sequelize.STRING";
  }
  if (key === "CHAR") {
    return options.length ? `Sequelize.CHAR(${options.length})` : "Sequelize.CHAR";
  }
  if (key === "TEXT") {
    return options.length ? `Sequelize.TEXT(${scalar(options.length)})` : "Sequelize.TEXT";
  }
  if (key === "INTEGER") return "Sequelize.INTEGER";
  if (key === "BIGINT") return "Sequelize.BIGINT";
  if (key === "FLOAT") return "Sequelize.FLOAT";
  if (key === "DOUBLE" || key === "DOUBLE PRECISION") return "Sequelize.DECIMAL(10, 2)";
  if (key === "BOOLEAN") return "Sequelize.BOOLEAN";
  if (key === "DATE") return "Sequelize.DATE";
  if (key === "DATEONLY") return "Sequelize.DATEONLY";
  if (key === "TIME") return "Sequelize.TIME";
  if (key === "JSON") return "Sequelize.JSON";
  if (key === "DECIMAL") {
    if (options.precision && options.scale !== undefined) {
      return `Sequelize.DECIMAL(${options.precision}, ${options.scale})`;
    }
    return "Sequelize.DECIMAL";
  }
  if (key === "ENUM") {
    const values = type.values || options.values || [];
    return `Sequelize.ENUM(${values.map(scalar).join(", ")})`;
  }

  const sql = type?.toSql?.();
  if (sql) return `Sequelize.literal(${scalar(sql)})`;

  throw new Error(`Unsupported data type: ${key || type}`);
};

const renderDefaultValue = (value) => {
  if (value?.key === "NOW") return "Sequelize.NOW";
  if (value?._isSequelizeMethod && value?.val) return `Sequelize.literal(${scalar(value.val)})`;
  return scalar(value);
};

const renderColumn = (attribute) => {
  const lines = [`type: ${renderDataType(attribute.type)}`];

  if (attribute.allowNull !== undefined) lines.push(`allowNull: ${scalar(attribute.allowNull)}`);
  if (attribute.primaryKey) lines.push("primaryKey: true");
  if (attribute.autoIncrement) lines.push("autoIncrement: true");
  if (attribute.unique) lines.push("unique: true");
  if (attribute.defaultValue !== undefined && !(attribute.defaultValue instanceof Date)) {
    lines.push(`defaultValue: ${renderDefaultValue(attribute.defaultValue)}`);
  }
  if (attribute.references) {
    const model = attribute.references.model;
    const tableName = typeof model === "string" ? model : model?.tableName || model?.name || model;
    lines.push(
      `references: {\n          model: ${scalar(tableName)},\n          key: ${scalar(attribute.references.key || "id")}\n        }`,
    );
    if (attribute.onUpdate) lines.push(`onUpdate: ${scalar(attribute.onUpdate)}`);
    if (attribute.onDelete) lines.push(`onDelete: ${scalar(attribute.onDelete)}`);
  }

  return `{\n${lines.map((line) => `        ${line}`).join(",\n")}\n      }`;
};

const getForeignKeyTables = (model) =>
  Object.values(model.rawAttributes)
    .map((attribute) => {
      const refModel = attribute.references?.model;
      if (!refModel) return null;
      return typeof refModel === "string" ? refModel : refModel.tableName || refModel.name;
    })
    .filter(Boolean);

const orderModels = (models) => {
  const byTable = new Map(models.map((model) => [model.tableName, model]));
  const pending = new Map(models.map((model) => [model.tableName, new Set(getForeignKeyTables(model))]));
  const ordered = [];

  while (pending.size) {
    const ready = [...pending.entries()]
      .filter(([table, deps]) => [...deps].every((dep) => dep === table || !pending.has(dep)))
      .map(([table]) => table)
      .sort();

    if (!ready.length) {
      const [table] = pending.keys();
      ready.push(table);
    }

    for (const table of ready) {
      ordered.push(byTable.get(table));
      pending.delete(table);
    }
  }

  return ordered;
};

const renderIndexes = (model) => {
  const indexes = model.options.indexes || [];
  if (!indexes.length) return "";

  return indexes
    .map((index) => {
      const options = { ...index };
      const fields = options.fields || [];
      delete options.fields;
      const optionEntries = Object.entries(options)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `      ${key}: ${scalar(value)}`);

      return `
    await queryInterface.addIndex("${model.tableName}", ${scalar(fields)}, {
${optionEntries.join(",\n")}
    });`;
    })
    .join("\n");
};

const renderMigration = (model) => {
  const attributes = Object.entries(model.rawAttributes)
    .map(([name, attribute]) => `      ${name}: ${renderColumn(attribute)}`)
    .join(",\n\n");

  return `"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("${model.tableName}", {
${attributes}
    });${renderIndexes(model)}
  },

  async down(queryInterface) {
    await queryInterface.dropTable("${model.tableName}");
  },
};
`;
};

const slugify = (tableName) =>
  tableName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

(async () => {
  fs.mkdirSync(migrationsDir, { recursive: true });

  for (const file of fs.readdirSync(migrationsDir)) {
    if (/^\d+-create-.*\.cjs$/.test(file) || /^\d+-initial-schema\.cjs$/.test(file)) {
      fs.unlinkSync(path.join(migrationsDir, file));
    }
  }

  const module = await import(pathToFileURL(modelsIndex).href);
  const modelFiles = fs
    .readdirSync(path.join(rootDir, "src", "models"))
    .filter((file) => file.endsWith(".js") && file !== "index.js");
  const directModules = await Promise.all(
    modelFiles.map((file) => import(pathToFileURL(path.join(rootDir, "src", "models", file)).href)),
  );

  const models = [...Object.values(module), ...directModules.map((item) => item.default)]
    .filter((value) => value?.rawAttributes && value?.tableName)
    .filter((model) => !ignoredTables.has(model.tableName));

  const uniqueModels = [...new Map(models.map((model) => [model.tableName, model])).values()];
  const ordered = orderModels(uniqueModels);

  ordered.forEach((model, index) => {
    const timestamp = String(20260530010000 + index).padStart(14, "0");
    const fileName = `${timestamp}-create-${slugify(model.tableName)}.cjs`;
    fs.writeFileSync(path.join(migrationsDir, fileName), renderMigration(model));
  });

  console.log(`Generated ${ordered.length} migration files.`);
  console.log(ordered.map((model, index) => `${index + 1}. ${model.tableName}`).join("\n"));
})();
