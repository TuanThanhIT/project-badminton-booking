import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
  DISCOUNT_VISIBILITY,
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
        notNull: { msg: "Discount code is required" },
        notEmpty: { msg: "Discount code must not be empty" },
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
        isIn: {
          args: [Object.values(DISCOUNT_APPLY_TYPE)],
          msg: "Invalid discount apply type",
        },
      },
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isFloat: { msg: "Discount value must be a number" },
        min: { args: [0.000001], msg: "Discount value must be greater than 0" },
      },
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isFloat: { msg: "Max discount must be a number" },
        min: { args: [0], msg: "Max discount must be >= 0" },
      },
    },
    minAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: { msg: "Minimum amount must be a number" },
        min: { args: [0], msg: "Minimum amount cannot be negative" },
      },
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Usage limit must be an integer" },
        min: { args: [1], msg: "Usage limit must be greater than 0" },
      },
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Usage count must be an integer" },
        min: { args: [0], msg: "Usage count cannot be negative" },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: { msg: "Start date must be a valid date" } },
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: { msg: "End date must be a valid date" } },
    },
    visibility: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_VISIBILITY)),
      allowNull: false,
      defaultValue: DISCOUNT_VISIBILITY.PUBLIC,
      validate: {
        isIn: {
          args: [Object.values(DISCOUNT_VISIBILITY)],
          msg: "Invalid discount visibility",
        },
      },
    },
    // Phạm vi áp dụng cho đặt sân. null = áp cho mọi chi nhánh.
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Branch ID must be an integer" },
        min: { args: [1], msg: "Branch ID must be a positive number" },
      },
    },
    // Khung giờ áp dụng (0-23). null = mọi giờ. Áp cho slot có startHour >= startHour và < endHour.
    startHour: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Start hour must be an integer" },
        min: { args: [0], msg: "Start hour must be between 0 and 23" },
        max: { args: [23], msg: "Start hour must be between 0 and 23" },
      },
    },
    endHour: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "End hour must be an integer" },
        min: { args: [1], msg: "End hour must be between 1 and 24" },
        max: { args: [24], msg: "End hour must be between 1 and 24" },
      },
    },
  },
  {
    tableName: "Discounts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

// Validate trước khi lưu
Discount.beforeValidate((discount) => {
  if (discount.endDate <= discount.startDate) {
    throw new Error("End date must be greater than start date");
  }
  if (discount.type === DISCOUNT_TYPE.PERCENT && discount.value > 100) {
    throw new Error("Percent discount cannot be greater than 100%");
  }
  if (
    discount.startHour != null &&
    discount.endHour != null &&
    discount.endHour <= discount.startHour
  ) {
    throw new Error("End hour must be greater than start hour");
  }
});

export default Discount;
