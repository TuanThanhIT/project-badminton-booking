import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CourtSchedule = sequelize.define(
  "CourtSchedule",
  {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    courtId: {
      type: DataTypes.INTEGER,
      references: { model: "Courts", key: "id" },
      allowNull: false,
    },
  },
  { tableName: "CourtSchedules", timestamps: false }
);

export default CourtSchedule;
