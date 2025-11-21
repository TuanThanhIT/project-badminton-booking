import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    paymentAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "MOMO"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Success",
        "Failed",
        "Cancelled",
        "Refunded"
      ),
      allowNull: false,
      defaultValue: "Pending",
    },
    transId: {
      type: DataTypes.STRING,
      allowNull: true, // Mã giao dịch MoMo trả về
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    refundAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "Payments",
    timestamps: false,
  }
);

export default Payment;
