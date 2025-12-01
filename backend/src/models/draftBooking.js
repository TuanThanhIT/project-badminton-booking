import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// DraftBooking
const DraftBooking = sequelize.define(
  "DraftBooking",
  {
    employeeId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    nameCustomer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Draft", "Paid", "Cancelled"),
      defaultValue: "Draft",
      allowNull: false,
    },
    currentStatus: {
      type: DataTypes.ENUM("Pending", "CheckedIn", "Playing", "Completed"),
      defaultValue: "Pending",
    },
    total: { type: DataTypes.DOUBLE, defaultValue: 0 },
  },
  {
    tableName: "DraftBookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default DraftBooking;
