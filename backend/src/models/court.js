import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Court = sequelize.define(
  "Court",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("name", value?.trim());
      },
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
  },
  {
    tableName: "Courts",
    timestamps: false,
  },
);

export default Court;
