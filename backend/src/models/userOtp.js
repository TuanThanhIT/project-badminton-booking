import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserOtp = sequelize.define(
  "UserOtp",
  {
    otpCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "UserOtps",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default UserOtp;
