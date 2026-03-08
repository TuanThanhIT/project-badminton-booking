import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CourtSchedule = sequelize.define(
  "CourtSchedule",
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Date is required",
        },
        isDate: {
          msg: "Date must be a valid date",
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
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Courts", key: "id" },
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
  },
  {
    tableName: "CourtSchedules",
    timestamps: false,
  },
);

export default CourtSchedule;
