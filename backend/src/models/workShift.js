import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// WorkShift (Ca làm)
const WorkShift = sequelize.define(
  "WorkShift",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: "Shift name must be between 2 and 100 characters",
        },
      },
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: "Work date is required" },
        isDate: {
          msg: "Work date must be a valid date",
        },
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "Start time is required" },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "Start time must be in format HH:mm",
        },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "End time is required" },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "End time must be in format HH:mm",
        },
      },
    },
    shiftWage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Shift wage is required" },
        isFloat: {
          msg: "Shift wage must be a number",
        },
        min: {
          args: [0.01],
          msg: "Shift wage must be greater than 0",
        },
      },
    },
  },
  {
    tableName: "WorkShifts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default WorkShift;
