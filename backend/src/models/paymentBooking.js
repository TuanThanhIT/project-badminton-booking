import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PaymentBooking = sequelize.define(
  "PaymentBooking",
  {
    paymentAmount: { type: DataTypes.DOUBLE, allowNull: false },
    paymentMethod: { type: DataTypes.ENUM("COD", "MOMO"), allowNull: false },
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
    transId: { type: DataTypes.STRING, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    refundAmount: { type: DataTypes.DOUBLE, allowNull: true },
    refundAt: { type: DataTypes.DATE, allowNull: true },
    bookingId: {
      type: DataTypes.INTEGER,
      references: { model: "Bookings", key: "id" },
      allowNull: false,
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "PaymentBookings",
    timestamps: false,
  }
);

export default PaymentBooking;
