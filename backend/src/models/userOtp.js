import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserOtp = sequelize.define(
  "UserOtp",
  {
    otpCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "OTP expiry is required" },
        isDate: {
          msg: "OTP expiry must be a valid date",
        },
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "isUsed must be a boolean",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "UserOtps",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default UserOtp;
