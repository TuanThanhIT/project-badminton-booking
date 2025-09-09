import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Report = sequelize.define(
  "Report",
  {
    typeReport: { type: DataTypes.STRING(255), allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "User", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Reports",
    timestamps: true, // bật tự động tạo
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Report;
