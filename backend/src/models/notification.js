import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title must not be empty",
        },
        len: {
          args: [1, 255],
          msg: "Title must not exceed 255 characters",
        },
      },
    },

    message: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "Message must not exceed 1000 characters",
        },
      },
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      validate: {
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "EMPLOYEE", "USER"),
      allowNull: true,
    },

    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Type must not exceed 255 characters",
        },
      },
    },
  },
  {
    tableName: "Notifications",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Notification;
