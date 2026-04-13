import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import { OTP_TYPE } from "../constants/userConstant.js";

const UserOtp = sequelize.define(
  "UserOtp",
  {
    otpCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "OTP code is required" },
        notEmpty: { msg: "OTP code cannot be empty" },
      },
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "OTP expiry is required" },
        isDate: { msg: "OTP expiry must be a valid date" },
        isAfterNow(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("OTP expiry must be in the future");
          }
        },
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: { msg: "isUsed must be a boolean" },
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(OTP_TYPE)),
      allowNull: false,
      validate: {
        notNull: { msg: "OTP type is required" },
        isIn: {
          args: [Object.values(OTP_TYPE)],
          msg: "Invalid OTP type",
        },
      },
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Attempts must be an integer" },
        min: {
          args: [0],
          msg: "Attempts cannot be negative",
        },
        max: {
          args: [10],
          msg: "Too many attempts",
        },
      },
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Reset token too long",
        },
      },
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Reset token expiry must be a valid date",
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
  },
  {
    tableName: "UserOtps",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",

    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["resetToken"],
      },
    ],
  },
);

export default UserOtp;
