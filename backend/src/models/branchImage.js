import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";

const BranchImage = sequelize.define(
  "BranchImage",
  {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Image URL is required" },
        isUrl: {
          msg: "Image URL must be a valid URL",
        },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
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
  },
  {
    tableName: "BranchImages",
    timestamps: false,
  },
);

export default BranchImage;
