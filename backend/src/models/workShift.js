import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { WORK_SHIFT_STATUS } from "../constants/workShiftConstant.js";
import Branch from "./branch.js";

const WorkShift = sequelize.define(
  "WorkShift",
  {
    shiftName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Shift name is required",
        },
        notEmpty: {
          msg: "Shift name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Shift name must not exceed 255 characters",
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
    cashierShiftWage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Cashier shift wage is required",
        },
        isFloat: {
          msg: "Cashier shift wage must be a number",
        },
        min: {
          args: [0],
          msg: "Cashier shift wage must be greater than or equal to 0",
        },
      },
    },
    staffShiftWage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Staff shift wage is required",
        },
        isFloat: {
          msg: "Staff shift wage must be a number",
        },
        min: {
          args: [0],
          msg: "Staff shift wage must be greater than or equal to 0",
        },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Branch,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Branch ID is required",
        },
        isInt: {
          msg: "Branch ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Branch ID must be a positive number",
        },
      },
    },
    shiftStatus: {
      type: DataTypes.ENUM(...Object.values(WORK_SHIFT_STATUS)),
      allowNull: false,
      defaultValue: WORK_SHIFT_STATUS.SCHEDULED,
      validate: {
        notNull: { msg: "Shift status is required" },
        isIn: {
          args: [Object.values(WORK_SHIFT_STATUS)],
          msg: "Invalid work shift status",
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
