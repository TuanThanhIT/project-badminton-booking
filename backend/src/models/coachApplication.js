import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { COACH_APPLICATION_STATUS } from "../constants/coachApplicationConstant.js";
import User from "./user.js";

const CoachApplication = sequelize.define(
  "CoachApplication",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(COACH_APPLICATION_STATUS)),
      allowNull: false,
      defaultValue: COACH_APPLICATION_STATUS.PENDING,
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    certificate: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    certificateImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    introduction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phoneContact: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    rejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "CoachApplications",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
    indexes: [
      {
        fields: ["userId", "status"],
        name: "idx_coach_app_user_status",
      },
    ],
  },
);

export default CoachApplication;
