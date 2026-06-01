import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { BOOKING_STATUS, CANCELLED_BY } from "../constants/bookingConstant.js";
import Branch from "./branch.js";
import User from "./user.js";
import Discount from "./discount.js";

const Booking = sequelize.define(
  "Booking",
  {
    bookingStatus: {
      type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)),
      allowNull: false,
      defaultValue: BOOKING_STATUS.PENDING,
      validate: {
        notNull: {
          msg: "Booking status is required",
        },
        isIn: {
          args: [Object.values(BOOKING_STATUS)],
          msg: "Invalid booking status",
        },
      },
    },
    previousBookingStatus: {
      type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(BOOKING_STATUS)],
          msg: "Invalid previous booking status",
        },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Total amount is required",
        },
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0],
          msg: "Total amount must be >= 0",
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Discount, key: "id" },
      validate: {
        isInt: {
          msg: "Discount ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Discount ID must be a positive number",
        },
      },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Note must be at most 500 characters",
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
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [5, 500],
          msg: "Cancel reason must be between 5 and 500 characters",
        },
      },
    },
    cancelRejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Cancel reject reason must be at most 500 characters",
        },
      },
    },
    cancelRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Cancel requested at must be a valid date",
        },
      },
    },
    cancelHandledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Cancel handled at must be a valid date",
        },
      },
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Cancelled at must be a valid date",
        },
      },
    },
  },
  {
    tableName: "Bookings",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Booking;
