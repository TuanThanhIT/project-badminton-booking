import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CourtPrice = sequelize.define(
  "CourtPrice",
  {
    dayOfWeek: {
      type: DataTypes.ENUM(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ),
      allowNull: false,
    },
    startTime: { type: DataTypes.TIME, allowNull: false }, // bắt đầu khung giờ
    endTime: { type: DataTypes.TIME, allowNull: false }, // kết thúc khung giờ
    price: { type: DataTypes.DOUBLE, allowNull: false }, // giá cho khung giờ đó
    periodType: {
      type: DataTypes.ENUM("Daytime", "Evening", "Weekend"),
      allowNull: false,
      defaultValue: "Daytime",
    },
  },
  {
    tableName: "CourtPrices",
    timestamps: false,
  }
);

export default CourtPrice;
