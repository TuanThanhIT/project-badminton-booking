import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import ShippingPartner from "./shippingPartner.js";

const ShippingPartnerShop = sequelize.define(
  "ShippingPartnerShop",
  {
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Shop ID is required",
        },
        isInt: {
          msg: "Shop ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Shop ID must be a positive number",
        },
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Token is required",
        },
        notEmpty: {
          msg: "Token must not be empty",
        },
        len: {
          args: [10, 255],
          msg: "Token length must be between 10 and 255 characters",
        },
      },
    },
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
    shippingPartnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ShippingPartner,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Shipping partner ID is required",
        },
        isInt: {
          msg: "Shipping partner ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Shipping partner ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "ShippingPartnerShops",
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["branchId", "shippingPartnerId"],
      },
      {
        fields: ["branchId"],
      },
      {
        fields: ["shippingPartnerId"],
      },
    ],
  },
);

export default ShippingPartnerShop;
