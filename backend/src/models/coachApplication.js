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
    status: {
      type: DataTypes.ENUM(...Object.values(COACH_APPLICATION_STATUS)),
      allowNull: false,
      defaultValue: COACH_APPLICATION_STATUS.PENDING,
      validate: {
        notNull: {
          msg: "Application status is required",
        },
        isIn: {
          args: [Object.values(COACH_APPLICATION_STATUS)],
          msg: "Invalid application status",
        },
      },
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
        max: {
          args: [50],
          msg: "Experience years must not exceed 50",
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
          if (value.length > 5) {
            throw new Error("Certificate images must not exceed 5 items");
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
    phoneContact: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "Phone contact must not exceed 20 characters",
        },
      },
    },
    rejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Reject reason must not exceed 500 characters",
        },
      },
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
      validate: {
        isInt: {
          msg: "Reviewer ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Reviewer ID must be a positive number",
        },
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Reviewed at must be a valid date",
        },
      },
    },
  },
  {
    tableName: "CoachApplications",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "status"],
        name: "idx_coach_app_user_status",
      },
    ],
  },
);

export default CoachApplication;
