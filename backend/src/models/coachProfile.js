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
    certificateImages: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidImageList(value) {
          if (value == null) return;
          if (!Array.isArray(value)) {
            throw new Error("Certificate images must be an array");
          }
          if (value.length > 10) {
            throw new Error("Certificate images must not exceed 10 items");
          }
          value.forEach((url) => {
            if (typeof url !== "string" || url.length > 1000) {
              throw new Error("Certificate image URL is invalid");
            }
          });
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
