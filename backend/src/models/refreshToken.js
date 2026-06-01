import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Refresh token must be unique",
      },
      validate: {
        notNull: { msg: "Refresh token is required" },
        notEmpty: { msg: "Refresh token cannot be empty" },
        len: {
          args: [10, 500],
          msg: "Refresh token length is invalid",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be positive",
        },
      },
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "Expiry is required" },
        isDate: { msg: "Expiry must be a valid date" },
        isAfterNow(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("Refresh token expiry must be in the future");
          }
        },
      },
    },
  },
  {
    tableName: "RefreshTokens",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",

    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["token"],
      },
    ],
  },
);

export default RefreshToken;
