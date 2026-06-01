import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Beverage = sequelize.define(
  "Beverage",
  {
    beverageName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("beverageName", value?.trim());
      },
      validate: {
        notNull: {
          msg: "Beverage name is required",
        },
        notEmpty: {
          msg: "Beverage name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Beverage name must be between 1 and 255 characters",
        },
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Thumbnail URL must be a valid URL",
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Price is required",
        },
        isFloat: {
          msg: "Price must be a number",
        },
        min: {
          args: [0],
          msg: "Price must be greater than or equal to 0",
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Stock is required",
        },
        isInt: {
          msg: "Stock must be an integer",
        },
        min: {
          args: [0],
          msg: "Stock must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "Beverages",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Beverage;
