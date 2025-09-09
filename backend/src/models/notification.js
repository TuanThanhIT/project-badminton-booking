import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.STRING(1000) },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "User", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Notifications",
    timestamps: true, // bật tự động tạo
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Notification;
