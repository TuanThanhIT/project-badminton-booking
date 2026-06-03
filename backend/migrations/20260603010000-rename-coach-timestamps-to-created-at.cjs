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

const syncColumnName = async (queryInterface, tableName, from, to) => {
  if (!(await tableExists(queryInterface, tableName))) return;

  const columns = await queryInterface.describeTable(tableName);
  const hasFrom = Boolean(columns[from]);
  const hasTo = Boolean(columns[to]);

  if (hasFrom && !hasTo) {
    await queryInterface.renameColumn(tableName, from, to);
    return;
  }

  if (hasFrom && hasTo) {
    await queryInterface.removeColumn(tableName, from);
  }
};

module.exports = {
  async up(queryInterface) {
    for (const tableName of TABLES) {
      await syncColumnName(queryInterface, tableName, "createdDate", "createdAt");
      await syncColumnName(queryInterface, tableName, "updatedDate", "updatedAt");
    }
  },

  async down(queryInterface) {
    for (const tableName of TABLES) {
      await syncColumnName(queryInterface, tableName, "createdAt", "createdDate");
      await syncColumnName(queryInterface, tableName, "updatedAt", "updatedDate");
    }
  },
};
