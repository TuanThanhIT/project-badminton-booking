"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BranchEmployees", {
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Branches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("BranchEmployees", ["branchId"]);
    await queryInterface.addIndex("BranchEmployees", ["employeeId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BranchEmployees");
  },
};
