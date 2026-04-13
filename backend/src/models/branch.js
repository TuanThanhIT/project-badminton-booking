import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Branch = sequelize.define(
  "Branch",
  {
    branchName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("branchName", value?.trim());
      },
      validate: {
        notNull: { msg: "Branch name is required" },
        notEmpty: { msg: "Branch name cannot be empty" },
        len: {
          args: [1, 255],
          msg: "Branch name must not exceed 255 characters",
        },
      },
    },

    // 👇 address chi tiết (số nhà, đường)
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "231 Lê Văn Chí",
      validate: {
        notNull: { msg: "Address is required" },
        len: {
          args: [1, 255],
          msg: "Address must not exceed 255 characters",
        },
      },
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Thủ Đức",
      validate: {
        notNull: { msg: "District is required" },
        notEmpty: { msg: "District cannot be empty" },
        len: {
          args: [1, 100],
          msg: "District must not exceed 100 characters",
        },
      },
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "TP.HCM",
      validate: {
        notNull: { msg: "City is required" },
        notEmpty: { msg: "City cannot be empty" },
        len: {
          args: [1, 100],
          msg: "City must not exceed 100 characters",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0912345678",
      validate: {
        notNull: { msg: "Phone number is required" },
        is: {
          args: /^[0-9]{9,11}$/,
          msg: "Phone number must contain 9 to 11 digits",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "Description branch is required" },
        notEmpty: { msg: "Description branch cannot be empty" },
        len: {
          args: [1, 65535],
          msg: "Description must not exceed 65535 characters",
        },
      },
    },

    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Thumbnail URL is required" },
        isUrl: { msg: "Thumbnail URL must be a valid URL" },
      },
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notNull: { msg: "isActive is required" },
        isBoolean: { msg: "isActive must be a boolean" },
      },
    },
    provinceCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Province code is required" },
      },
    },
    districtCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "District code is required" },
      },
    },
    wardCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Ward code is required" },
      },
    },
  },
  {
    tableName: "Branches",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Branch;