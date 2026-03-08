import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DraftBookingItem = sequelize.define(
  "DraftBookingItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "DraftBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    courtScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "CourtSchedules", key: "id" },
      validate: {
        isInt: {
          msg: "Court schedule ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Court schedule ID must be a positive number",
        },
      },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Price must be a number",
        },
        min: {
          args: [0],
          msg: "Price must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "DraftBookingItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default DraftBookingItem;
