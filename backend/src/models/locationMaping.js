import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LocationMapping = sequelize.define(
  "LocationMapping",
  {
    provinceCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "provinceCode is required" },
        notEmpty: { msg: "provinceCode cannot be empty" },
        len: {
          args: [1, 20],
          msg: "provinceCode must be 1-20 characters",
        },
      },
    },

    districtCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "districtCode is required" },
        notEmpty: { msg: "districtCode cannot be empty" },
        len: {
          args: [1, 20],
          msg: "districtCode must be 1-20 characters",
        },
      },
    },

    ghnProvinceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "ghnProvinceId is required" },
        isInt: { msg: "ghnProvinceId must be an integer" },
        min: {
          args: [1],
          msg: "ghnProvinceId must be > 0",
        },
      },
    },

    ghnDistrictId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "ghnDistrictId is required" },
        isInt: { msg: "ghnDistrictId must be an integer" },
        min: {
          args: [1],
          msg: "ghnDistrictId must be > 0",
        },
      },
    },

    wardCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "wardCode must be <= 20 characters",
        },
      },
    },

    ghnWardCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "ghnWardCode must be <= 20 characters",
        },
      },
    },
  },
  {
    tableName: "LocationMappings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",

    indexes: [
      {
        unique: true,
        fields: ["provinceCode", "districtCode"],
      },
    ],
  },
);

export default LocationMapping;
