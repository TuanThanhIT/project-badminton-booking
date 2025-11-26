import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// WorkShift (Ca làm)
const WorkShift = sequelize.define(
  "WorkShift",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    shiftWage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "WorkShifts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default WorkShift;
