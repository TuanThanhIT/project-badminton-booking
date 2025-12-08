import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    title: { type: DataTypes.STRING(255), allowNull: false },

    message: { type: DataTypes.STRING(1000) },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "EMPLOYEE", "USER"),
      allowNull: true,
    },

    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "Notifications",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Notification;
