import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CashRegister = sequelize.define(
  "CashRegister",
  {
    workShiftEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Work shift employee ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Work shift employee ID must be a positive number",
        },
      },
      references: {
        model: "WorkShiftEmployees",
        key: "id",
      },
    },
    openingCash: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
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
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: {
          msg: "Closing cash must be a number",
        },
        min: {
          args: [0],
          msg: "Closing cash must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "CashRegisters",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default CashRegister;
