import { DataTypes, INTEGER } from "sequelize";
import sequelize from "../config/db.js";

const GeneralFeedback = sequelize.define(
  "GeneralFeedback",
  {
    content: { type: DataTypes.STRING(1000) },
    rating: { type: INTEGER, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "User", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "GeneralFeedbacks",
    timestamps: true, // bật tự động tạo
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default GeneralFeedback;
