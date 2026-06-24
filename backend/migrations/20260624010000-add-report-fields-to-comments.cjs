"use strict";

const addColumnIfMissing = async (queryInterface, Sequelize, column, definition) => {
  const table = await queryInterface.describeTable("Comments");
  if (!table[column]) {
    await queryInterface.addColumn("Comments", column, definition);
  }
};

const removeColumnIfExists = async (queryInterface, column) => {
  const table = await queryInterface.describeTable("Comments");
  if (table[column]) {
    await queryInterface.removeColumn("Comments", column);
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, "isDeleted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "reportCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "autoHiddenByReports", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "hiddenReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, Sequelize, "hiddenAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, "hiddenAt");
    await removeColumnIfExists(queryInterface, "hiddenReason");
    await removeColumnIfExists(queryInterface, "autoHiddenByReports");
    await removeColumnIfExists(queryInterface, "reportCount");
    await removeColumnIfExists(queryInterface, "isActive");
  },
};
