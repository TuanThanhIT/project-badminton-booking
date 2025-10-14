import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    paymentAmount: { type: DataTypes.DOUBLE, allowNull: false },
    paymentMethod: { type: DataTypes.STRING, allowNull: false, unique: true },
    paymentStatus: {
      type: DataTypes.ENUM("Pending", "Success", "Fail", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    transactionCode: { type: DataTypes.STRING, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    orderId: {
      type: DataTypes.INTEGER,
      references: { model: "Orders", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Payments",
    timestamps: false,
  }
);
export default Payment;
