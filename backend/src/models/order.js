import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ORDER_STATUS, SHIPPING_STATUS } from "../constants/orderConstant.js";
import { CANCELLED_BY } from "../constants/bookingConstant.js";
import Branch from "./branch.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      allowNull: false,
      defaultValue: ORDER_STATUS.PENDING,
      validate: {
        notNull: { msg: "Order status is required" },
        isIn: {
          args: [Object.values(ORDER_STATUS)],
          msg: "Invalid order status",
        },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Subtotal is required" },
        isDecimal: { msg: "Subtotal must be a number" },
        min: {
          args: [0],
          msg: "Subtotal must be >= 0",
        },
      },
    },
    shippingFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Shipping fee is required" },
        isDecimal: { msg: "Shipping fee must be a number" },
        min: {
          args: [0],
          msg: "Shipping fee must be >= 0",
        },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Total amount is required" },
        isDecimal: { msg: "Total amount must be a number" },
        min: {
          args: [0],
          msg: "Total amount must be >= 0",
        },
      },
    },
    shippingName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping name is required" },
        notEmpty: { msg: "Shipping name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Shipping name must be between 2 and 255 characters",
        },
      },
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: "Phone number is required" },
        is: {
          args: /^[0-9]{9,11}$/,
          msg: "Phone number must contain 9 to 11 digits",
        },
      },
    },
    shippingAddress: {
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
    shippingDistrictId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping districtId is required" },
        isInt: { msg: "DistrictId must be an integer" },
        min: {
          args: [1],
          msg: "Shipping districtId must be greater than 0",
        },
      },
    },
    shippingWardCode: {
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
    shippingWeight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping weight is required" },
        isFloat: { msg: "Shipping weight must be a number" },
        min: {
          args: [0.01],
          msg: "Shipping weight must be greater than 0",
        },
      },
    },
    shippingServiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping service ID is required" },
        isInt: { msg: "Shipping service ID must be an integer" },
        min: {
          args: [1],
          msg: "Shipping service ID must be positive",
        },
      },
    },
    shippingFeeReal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        isDecimal: { msg: "Shipping fee real must be a number" },
        min: {
          args: [0],
          msg: "Shipping fee real must be >= 0",
        },
      },
    },
    shippingStatus: {
      type: DataTypes.ENUM(...Object.values(SHIPPING_STATUS)),
      allowNull: false,
      defaultValue: SHIPPING_STATUS.PENDING,
      validate: {
        notNull: { msg: "Shipping status is required" },
        isIn: {
          args: [Object.values(SHIPPING_STATUS)],
          msg: "Invalid shipping status",
        },
      },
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "deliveredAt must be a valid date",
        },
      },
    },
    trackingCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Tracking code must be at most 255 characters",
        },
      },
    },
    shippingOrderCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Shipping order code must be at most 255 characters",
        },
      },
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Estimated delivery must be a valid date",
        },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
      validate: {
        notNull: { msg: "Branch ID is required" },
        isInt: { msg: "Branch ID must be an integer" },
        min: {
          args: [1],
          msg: "Branch ID must be a positive number",
        },
      },
    },
    orderGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Order group ID is required" },
        isInt: { msg: "Order group ID must be an integer" },
        min: {
          args: [1],
          msg: "Order group ID must be positive",
        },
      },
    },
    cancelledBy: {
      type: DataTypes.ENUM(...Object.values(CANCELLED_BY)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(CANCELLED_BY)],
          msg: "Invalid cancelled by value",
        },
      },
    },
    cancelReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [5, 255],
          msg: "Cancel reason must be between 5 and 255 characters",
        },
      },
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",

    indexes: [
      { fields: ["orderGroupId"] },
      { fields: ["branchId"] },
      { fields: ["trackingCode"] },
    ],
  },
);

Order.beforeValidate((order) => {
  const expected = Number(order.subtotal) + Number(order.shippingFee);

  if (Number(order.totalAmount).toFixed(2) !== expected.toFixed(2)) {
    throw new Error("Invalid order total amount");
  }
});

export default Order;
