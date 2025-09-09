import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 50],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
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
