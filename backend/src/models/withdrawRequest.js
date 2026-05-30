import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Wallet from "./wallet.js";
import { WITHDRAW_REQUEST_STATUS } from "../constants/paymentConstant.js";

const WithdrawRequest = sequelize.define(
  "WithdrawRequest",
  {
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Wallet, key: "id" },
      validate: {
        notNull: { msg: "Wallet ID is required" },
        isInt: { msg: "Wallet ID must be an integer" },
        min: {
          args: [1],
          msg: "Wallet ID must be a positive number",
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Amount is required" },
        isDecimal: { msg: "Amount must be a number" },
        min: {
          args: [1000],
          msg: "Minimum withdraw amount is 1,000",
        },
      },
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Bank name is required" },
        len: {
          args: [2, 100],
          msg: "Bank name must be between 2 and 100 characters",
        },
      },
    },
    bankAccount: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Bank account is required" },
        len: {
          args: [6, 50],
          msg: "Bank account must be between 6 and 50 characters",
        },
      },
    },
    accountHolder: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Account holder is required" },
        len: {
          args: [2, 100],
          msg: "Account holder must be between 2 and 100 characters",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WITHDRAW_REQUEST_STATUS)),
      allowNull: false,
      defaultValue: "PENDING",
      validate: {
        isIn: {
          args: [Object.values(WITHDRAW_REQUEST_STATUS)],
          msg: "Invalid withdraw status",
        },
      },
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "ProcessedAt must be a valid date",
        },
      },
    },
  },
  {
    tableName: "WithdrawRequests",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    indexes: [{ fields: ["walletId"] }, { fields: ["status"] }],
  },
);

export default WithdrawRequest;
