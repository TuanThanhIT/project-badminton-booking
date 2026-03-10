import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import DraftBooking from "./draftBooking.js";
import Court from "./court.js";

const DraftBookingItem = sequelize.define(
  "DraftBookingItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: DraftBooking, key: "id" },
      validate: {
        notNull: {
          msg: "Draft ID is required",
        },
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Court, key: "id" },
      validate: {
        notNull: {
          msg: "Court ID is required",
        },
        isInt: {
          msg: "Court ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Court ID must be a positive number",
        },
      },
    },
    playDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Play date is required",
        },
        isDate: {
          msg: "Play date must be a valid date",
        },
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Start time is required",
        },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "Start time must be in HH:mm format",
        },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: {
          msg: "End time is required",
        },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "End time must be in HH:mm format",
        },
      },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Price is required" },
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
