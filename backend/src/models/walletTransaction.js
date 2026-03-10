import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { WALLET_TRANSACTION_TYPE } from "../constants/paymentConstant.js";
import Wallet from "./wallet.js";

const WalletTransaction = sequelize.define(
  "WalletTransaction",
  {
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Wallet, key: "id" },
      validate: {
        notNull: {
          msg: "Wallet ID is required",
        },
        isInt: {
          msg: "Wallet ID must be an integer",
        },
      },
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Amount is required" },
        isFloat: {
          msg: "Amount must be a number",
        },
        min: {
          args: [0.01],
          msg: "Amount must be greater than 0",
        },
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
  },
);

export default WalletTransaction;
