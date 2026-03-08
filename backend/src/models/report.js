import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Report = sequelize.define(
  "Report",
  {
    typeReport: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Report type cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Report type must not exceed 255 characters",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "Reports",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Report;
