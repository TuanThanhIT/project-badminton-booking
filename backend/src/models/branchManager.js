import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import User from "./user.js";

const BranchManager = sequelize.define(
  "BranchManager",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
      validate: {
        notNull: { msg: "Branch ID is required" },
        isInt: { msg: "Branch ID must be an integer" },
        min: { args: [1], msg: "Branch ID must be a positive number" },
      },
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "Manager ID is required" },
        isInt: { msg: "Manager ID must be an integer" },
        min: { args: [1], msg: "Manager ID must be a positive number" },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    revokedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "BranchManagers",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default BranchManager;
