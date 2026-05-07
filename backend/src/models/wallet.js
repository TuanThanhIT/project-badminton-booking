import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import { WALLET_STATUS } from "../constants/paymentConstant.js";

const Wallet = sequelize.define(
  "Wallet",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Balance is required" },
        isDecimal: {
          msg: "Balance must be a valid number",
        },
        min: {
          args: [0],
          msg: "Balance cannot be negative",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WALLET_STATUS)),
      allowNull: false,
      defaultValue: WALLET_STATUS.ACTIVE,
      validate: {
        notNull: { msg: "Wallet status is required" },
        isIn: {
          args: [Object.values(WALLET_STATUS)],
          msg: "Invalid wallet status",
        },
      },
    },
  },
  {
    tableName: "Wallets",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Wallet;
