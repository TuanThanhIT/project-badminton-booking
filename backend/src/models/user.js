import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Role from "./role.js";

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Username is required" },
        notEmpty: { msg: "Username cannot be empty" },
        len: {
          args: [3, 50],
          msg: "Username must be between 3 and 50 characters",
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: "Username can only contain letters, numbers and underscore",
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required" },
        notEmpty: { msg: "Password cannot be empty" },
        len: {
          args: [6, 255],
          msg: "Password must be at least 6 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email is required" },
        notEmpty: { msg: "Email cannot be empty" },
        isEmail: {
          msg: "Invalid email format",
        },
        len: {
          args: [5, 255],
          msg: "Email must not exceed 255 characters",
        },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "isVerified must be a boolean",
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      validate: {
        isBoolean: {
          msg: "isActive must be a boolean",
        },
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Role, key: "id" },
      validate: {
        notNull: { msg: "Role ID is required" },
        isInt: { msg: "Role ID must be an integer" },
        min: {
          args: [1],
          msg: "Role ID must be greater than 0",
        },
      },
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default User;
