import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Branch = sequelize.define(
  "Branch",
  {
    // ================= BASIC INFO =================
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
          args: [2, 255],
          msg: "Branch name must be 2-255 characters",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Phone number is required" },
        notEmpty: { msg: "Phone number cannot be empty" },
        is: {
          args: /^[0-9]{9,11}$/,
          msg: "Phone number must be 9-11 digits",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "Description is required" },
        notEmpty: { msg: "Description cannot be empty" },
        len: {
          args: [10, 65535],
          msg: "Description must be at least 10 characters",
        },
      },
    },
    // ================= ADDRESS DISPLAY =================
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Address is required" },
        notEmpty: { msg: "Address cannot be empty" },
        len: {
          args: [5, 255],
          msg: "Address must be 5-255 characters",
        },
      },
    },
    districtName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "District name is required" },
        notEmpty: { msg: "District name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "District name must be 2-100 characters",
        },
      },
    },
    provinceName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Province name is required" },
        notEmpty: { msg: "Province name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Province name must be 2-100 characters",
        },
      },
    },
    wardName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "Ward name must be <= 100 characters",
        },
      },
    },
    // ================= GHN SHIPPING ORIGIN =================
    provinceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "ProvinceId is required" },
        isInt: { msg: "ProvinceId must be integer" },
        min: {
          args: [1],
          msg: "ProvinceId must be greater than 0",
        },
      },
    },
    districtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "DistrictId is required" },
        isInt: { msg: "DistrictId must be integer" },
        min: {
          args: [1],
          msg: "DistrictId must be greater than 0",
        },
      },
    },
    wardCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "WardCode must be <= 20 characters",
        },
        is: {
          args: /^[0-9A-Za-z]*$/,
          msg: "WardCode format invalid",
        },
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: "Latitude is required" },
        isFloat: { msg: "Latitude must be number" },
        min: {
          args: [-90],
          msg: "Latitude must be >= -90",
        },
        max: {
          args: [90],
          msg: "Latitude must be <= 90",
        },
      },
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: "Longitude is required" },
        isFloat: { msg: "Longitude must be number" },
        min: {
          args: [-180],
          msg: "Longitude must be >= -180",
        },
        max: {
          args: [180],
          msg: "Longitude must be <= 180",
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "isActive must be boolean",
        },
      },
    },
    ghnShopId: {
      type: DataTypes.INTEGER,
      allowNull: true, // có thể cho null nếu chưa setup GHN
      validate: {
        isInt: { msg: "ghnShopId must be integer" },
        min: {
          args: [1],
          msg: "ghnShopId must be > 0",
        },
      },
    },
  },
  {
    tableName: "Branches",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      { fields: ["provinceId"] },
      { fields: ["districtId"] },
      { fields: ["isActive"] },
    ],
  },
);

export default Branch;
