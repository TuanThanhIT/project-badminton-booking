import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ShippingPartner = sequelize.define(
  "ShippingPartner",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value?.trim());
      },
      validate: {
        notNull: { msg: "Shipping partner name is required" },
        notEmpty: { msg: "Shipping partner name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Shipping partner name must be between 2 and 255 characters",
        },
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("code", value?.trim().toUpperCase());
      },
      validate: {
        notNull: { msg: "Shipping partner code is required" },
        notEmpty: { msg: "Shipping partner code cannot be empty" },
        len: {
          args: [2, 50],
          msg: "Shipping partner code must be between 2 and 50 characters",
        },
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
  },
  {
    tableName: "ShippingPartners",
    timestamps: false,
  },
);

export default ShippingPartner;
