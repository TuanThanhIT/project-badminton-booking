import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BookingFeedback = sequelize.define(
  "BookingFeedback",
  {
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Content must not be empty",
        },
        len: {
          args: [1, 1000],
          msg: "Content must be between 1 and 1000 characters",
        },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Rating must be an integer",
        },
        min: {
          args: [1],
          msg: "Rating must be at least 1",
        },
        max: {
          args: [5],
          msg: "Rating must be at most 5",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Bookings",
        key: "id",
      },
      onDelete: "CASCADE",
      validate: {
        isInt: {
          msg: "Booking ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Booking ID must be a positive number",
        },
      },
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Courts",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "Court ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Court ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "BookingFeedbacks",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default BookingFeedback;
