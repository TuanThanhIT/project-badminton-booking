import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { USER_ADDRESS_LABEL } from "../constants/userConstant.js";

const UserAddress = sequelize.define(
  "UserAddress",
  {
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Full name is required" },
        notEmpty: { msg: "Full name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Full name must be between 2 and 255 characters",
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
          msg: "Phone number must contain 9 to 11 digits",
        },
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Address is required" },
        notEmpty: { msg: "Address cannot be empty" },
        len: {
          args: [5, 255],
          msg: "Address must be between 5 and 255 characters",
        },
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: "Latitude is required" },
        isFloat: { msg: "Latitude must be a number" },
        min: { args: [-90], msg: "Latitude must be >= -90" },
        max: { args: [90], msg: "Latitude must be <= 90" },
      },
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: "Longitude is required" },
        isFloat: { msg: "Longitude must be a number" },
        min: { args: [-180], msg: "Longitude must be >= -180" },
        max: { args: [180], msg: "Longitude must be <= 180" },
      },
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: { msg: "isDefault must be a boolean value" },
      },
    },
    ward: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Ward is required" },
        notEmpty: { msg: "Ward cannot be empty" },
        len: {
          args: [1, 100],
          msg: "Ward must not exceed 100 characters",
        },
      },
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "District is required" },
        notEmpty: { msg: "District cannot be empty" },
        len: {
          args: [1, 100],
          msg: "District must not exceed 100 characters",
        },
      },
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Province is required" },
        notEmpty: { msg: "Province cannot be empty" },
        len: {
          args: [1, 100],
          msg: "Province must not exceed 100 characters",
        },
      },
    },
    provinceCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Province code is required" },
        notEmpty: { msg: "Province code cannot be empty" },
        len: {
          args: [1, 20],
          msg: "Province code must be <= 20 characters",
        },
      },
    },
    districtCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "District code is required" },
        notEmpty: { msg: "District code cannot be empty" },
        len: {
          args: [1, 20],
          msg: "District code must be <= 20 characters",
        },
      },
    },
    wardCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Ward code is required" },
        notEmpty: { msg: "Ward code cannot be empty" },
        len: {
          args: [1, 20],
          msg: "Ward code must be <= 20 characters",
        },
      },
    },
    label: {
      type: DataTypes.ENUM(...Object.values(USER_ADDRESS_LABEL)),
      allowNull: false,
      defaultValue: USER_ADDRESS_LABEL.HOME,
      validate: {
        notNull: { msg: "Address label is required" },
        isIn: {
          args: [Object.values(USER_ADDRESS_LABEL)],
          msg: "Invalid address label",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be positive",
        },
      },
    },
  },
  {
    tableName: "UserAddresses",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["provinceCode"] },
      { fields: ["districtCode"] },
      { fields: ["wardCode"] },
    ],
  },
);

export default UserAddress;
