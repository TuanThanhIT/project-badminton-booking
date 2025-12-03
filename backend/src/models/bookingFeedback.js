import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BookingFeedback = sequelize.define(
  "BookingFeedback",
  {
    content: { type: DataTypes.STRING(1000), allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Bookings", key: "id" },
      onDelete: "CASCADE",
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Courts", key: "id" },
    },
  },
  {
    tableName: "BookingFeedbacks",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default BookingFeedback;
