import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import WorkShiftEmployee from "./workShiftEmployee.js";

const CashRegister = sequelize.define(
  "CashRegister",
  {
    workShiftEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkShiftEmployee,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Work shift employee ID is required",
        },
        isInt: {
          msg: "Work shift employee ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Work shift employee ID must be a positive number",
        },
      },
    },
    openingCash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Opening cash is required",
        },
        isFloat: {
          msg: "Opening cash must be a number",
        },
        min: {
          args: [0],
          msg: "Opening cash must be greater than or equal to 0",
        },
      },
    },
    closingCash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Closing cash is required",
        },
        isFloat: {
          msg: "Closing cash must be a number",
        },
        min: {
          args: [0],
          msg: "Closing cash must be greater than or equal to 0",
        },
      },
    },
    expectedCash: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Expected cash is required",
        },
        isFloat: {
          msg: "Expected cash must be a number",
        },
        min: {
          args: [0],
          msg: "Expected cash must be greater than or equal to 0",
        },
      },
    },
    difference: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Difference must be a number",
        },
      },
    },
  },
  {
    tableName: "CashRegisters",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default CashRegister;
