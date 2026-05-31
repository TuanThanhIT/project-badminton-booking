import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { COURT_STATUS } from "../constants/courtConstant.js";
import Branch from "./branch.js";

const Court = sequelize.define(
  "Court",
  {
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Branch,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Branch ID is required",
        },
        isInt: {
          msg: "Branch ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Branch ID must be a positive number",
        },
      },
    },
    courtName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Court name is required",
        },
        notEmpty: {
          msg: "Court name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Court name must not exceed 255 characters",
        },
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue("location", value?.trim());
      },
      validate: {
        notNull: {
          msg: "Location is required",
        },
        notEmpty: {
          msg: "Location cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Location must not exceed 255 characters",
        },
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Thumbnail URL must be a valid URL",
        },
      },
    },
    courtStatus: {
      type: DataTypes.ENUM(...Object.values(COURT_STATUS)),
      allowNull: false,
      defaultValue: COURT_STATUS.ACTIVE,
      validate: {
        notNull: { msg: "Court status is required" },
        isIn: {
          args: [Object.values(COURT_STATUS)],
          msg: "Invalid court status",
        },
      },
    },
  },
  {
    tableName: "Courts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Court;
