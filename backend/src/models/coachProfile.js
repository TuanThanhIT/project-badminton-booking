import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const CoachProfile = sequelize.define(
  "CoachProfile",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Experience years is required",
        },
        isInt: {
          msg: "Experience years must be an integer",
        },
        min: {
          args: [0],
          msg: "Experience years must be greater than or equal to 0",
        },
      },
    },
    certificate: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Certificate must not exceed 500 characters",
        },
      },
    },
    introduction: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Introduction must not exceed 2000 characters",
        },
      },
    },
  },
  {
    tableName: "CoachProfiles",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default CoachProfile;
