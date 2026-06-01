"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BranchEmployees", {
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
          model: "Branches",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      }
    });
    await queryInterface.addIndex("BranchEmployees", ["branchId","employeeId"], {
      unique: true,
      name: "branch_employees_branch_id_employee_id"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BranchEmployees");
  },
};
