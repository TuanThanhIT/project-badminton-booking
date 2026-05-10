import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../constants/paymentConstant.js";
import Wallet from "./wallet.js";
import Payment from "./payment.js";
import { validate } from "uuid";

const WalletTransaction = sequelize.define(
  "WalletTransaction",
  {
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Wallet, key: "id" },
      validate: {
        notNull: { msg: "Wallet ID is required" },
        isInt: { msg: "Wallet ID must be an integer" },
        min: { args: [1], msg: "Wallet ID must be a positive number" },
      },
    },

    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Payment, key: "id" },
      validate: {
        isInt: { msg: "Payment ID must be integer" },
        min: { args: [1], msg: "Payment ID must be a positive number" },
      },
    },

    withdrawRequestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "WithdrawRequest ID must be integer" },
        min: {
          args: [1],
          msg: "WithdrawRequest ID must be a positive number",
        },
      },
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Amount is required" },
        isDecimal: { msg: "Amount must be number" },
        min: { args: [0.01], msg: "Amount must be > 0" },
      },
    },

    type: {
      type: DataTypes.ENUM(...Object.values(WALLET_TRANSACTION_TYPE)),
      allowNull: false,
      validate: {
        notNull: { msg: "Wallet transaction type is required" },
        isIn: {
          args: [Object.values(WALLET_TRANSACTION_TYPE)],
          msg: "Invalid wallet transaction type",
        },
      },
    },

    status: {
      type: DataTypes.ENUM(...Object.values(WALLET_TRANSACTION_STATUS)),
      allowNull: false,
      defaultValue: WALLET_TRANSACTION_STATUS.PENDING,
      validate: {
        notNull: { msg: "Wallet transaction status is required" },
        isIn: {
          args: [Object.values(WALLET_TRANSACTION_STATUS)],
          msg: "Invalid wallet transaction status",
        },
      },
    },

    expiredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Description must not exceed 500 characters",
        },
      },
    },
  },
  {
    tableName: "WalletTransactions",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
    indexes: [
      { fields: ["walletId"] },
      { fields: ["paymentId"] },
      { fields: ["status"] },
      { fields: ["expiredAt"] },
    ],
  },
);

export default WalletTransaction;
