import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { USER_ADDRESS_LABEL } from "../constants/userConstant.js";

const UserAddress = sequelize.define(
  "UserAddress",
  {
    // ================= USER INFO =================
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Full name is required" },
        notEmpty: { msg: "Full name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Full name must be 2-255 characters",
        },
        is: {
          args: /^[\p{L} ]+$/u,
          msg: "Full name must contain only letters",
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

    // ================= DISPLAY =================
    provinceName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Province name is required" },
        len: { args: [2, 100] },
      },
    },

    districtName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "District name is required" },
        len: { args: [2, 100] },
      },
    },

    wardName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Ward name is required" },
        len: { args: [2, 100] },
      },
    },

    // ================= GHN SHIPPING (IMPORTANT) =================
    provinceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "ProvinceId is required" },
        isInt: { msg: "ProvinceId must be an integer" },
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
        isInt: { msg: "DistrictId must be an integer" },
        min: {
          args: [1],
          msg: "DistrictId must be greater than 0",
        },
      },
    },

    wardCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "WardCode is required" },
        notEmpty: { msg: "WardCode cannot be empty" },
        len: {
          args: [1, 20],
          msg: "WardCode must be <= 20 characters",
        },
        is: {
          args: /^[0-9A-Za-z]+$/,
          msg: "WardCode invalid format",
        },
      },
    },

    // ================= OPTIONAL =================
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: -90,
        max: 90,
      },
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: -180,
        max: 180,
      },
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    label: {
      type: DataTypes.ENUM(...Object.values(USER_ADDRESS_LABEL)),
      allowNull: false,
      defaultValue: USER_ADDRESS_LABEL.HOME,
      validate: {
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
        notNull: { msg: "UserId is required" },
        isInt: { msg: "UserId must be an integer" },
        min: {
          args: [1],
          msg: "UserId must be positive",
        },
      },
    },
  },
  {
    tableName: "UserAddresses",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["provinceId"] },
      { fields: ["districtId"] },
      { fields: ["wardCode"] },
    ],
  },
);

export default UserAddress;
