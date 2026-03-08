import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductFeedback = sequelize.define(
  "ProductFeedback",
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
  },
  {
    tableName: "ProductFeedbacks",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);
export default ProductFeedback;
