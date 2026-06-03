import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import User from "./user.js";

const BranchEmployee = sequelize.define(
  "BranchEmployee",
  {
    branchId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Branch,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Branch ID is required",
        },
        isInt: {
          msg: "Branch ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Branch ID must be a positive number",
        },
      },
    },

    employeeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Employee ID is required",
        },
        isInt: {
          msg: "Employee ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Employee ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "BranchEmployees",
    timestamps: false,
  },
);

export default BranchEmployee;
