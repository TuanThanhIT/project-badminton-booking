"use strict";

const TABLES = ["CoachApplications", "ClassRooms", "ClassEnrollments"];

const tableExists = async (queryInterface, tableName) => {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
};

const quoteIdentifier = (value) => `\`${value}\``;

const ensureTimestampColumn = async (queryInterface, Sequelize, tableName, columnName) => {
  let columns = await queryInterface.describeTable(tableName);

  if (!columns[columnName]) {
    await queryInterface.addColumn(tableName, columnName, {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

  columns = await queryInterface.describeTable(tableName);
  const fallbackColumns = ["createdDate", "updatedDate", "createdAt", "updatedAt"]
    .filter((name) => name !== columnName && columns[name])
    .map(quoteIdentifier);

  const fallbackExpression = [quoteIdentifier(columnName), ...fallbackColumns, "NOW()"].join(", ");

  await queryInterface.sequelize.query(
    `UPDATE ${quoteIdentifier(tableName)} SET ${quoteIdentifier(columnName)} = COALESCE(${fallbackExpression}) WHERE ${quoteIdentifier(columnName)} IS NULL`,
  );

  await queryInterface.changeColumn(tableName, columnName, {
    type: Sequelize.DATE,
    allowNull: false,
  });
};

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const tableName of TABLES) {
      if (!(await tableExists(queryInterface, tableName))) continue;

      await ensureTimestampColumn(queryInterface, Sequelize, tableName, "createdAt");
      await ensureTimestampColumn(queryInterface, Sequelize, tableName, "updatedAt");
    }
  },

  async down() {
    // Keep repaired timestamp columns in place; removing them would break the Sequelize models.
  },
};
