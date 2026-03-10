import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
} from "../constants/discountConstant.js";

const Discount = sequelize.define(
  "Discount",
  {
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("code", value?.trim().toUpperCase());
      },
      validate: {
        notNull: {
          msg: "Discount code is required",
        },
        notEmpty: {
          msg: "Discount code must not be empty",
        },
        len: {
          args: [3, 30],
          msg: "Discount code must be between 3 and 30 characters",
        },
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_TYPE)),
      allowNull: false,
      defaultValue: DISCOUNT_TYPE.AMOUNT,
      validate: {
        notNull: {
          msg: "Discount type is required",
        },
        isIn: {
          args: [Object.values(DISCOUNT_TYPE)],
          msg: "Invalid discount type",
        },
      },
    },
    applyType: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_APPLY_TYPE)),
      allowNull: false,
      defaultValue: DISCOUNT_APPLY_TYPE.ALL,
      validate: {
        notNull: {
          msg: "Discount apply type is required",
        },
        isIn: {
          args: [Object.values(DISCOUNT_APPLY_TYPE)],
          msg: "Invalid discount apply type",
        },
      },
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Discount value is required" },
        isFloat: {
          msg: "Discount value must be a number",
        },
        min: {
          args: [0.0000001],
          msg: "Discount value must be greater than 0",
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notNull: { msg: "isActive is required" },
        isBoolean: {
          msg: "isActive must be a boolean",
        },
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notNull: { msg: "isUsed is required" },
        isBoolean: {
          msg: "isUsed must be a boolean",
        },
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Start date is required",
        },
        isDate: {
          msg: "Start date must be a valid date",
        },
      },
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: "End date is required",
        },
        isDate: {
          msg: "End date must be a valid date",
        },
      },
    },
    minAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Minimum amount must be a number",
        },
        min: {
          args: [0],
          msg: "Minimum amount cannot be negative",
        },
      },
    },
  },
  {
    tableName: "Discounts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Discount;
