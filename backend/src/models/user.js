import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: { model: "Roles", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default User;
