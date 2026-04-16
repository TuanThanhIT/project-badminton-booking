import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "./product.js";

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    sku: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "SKU must not exceed 255 characters",
        },
      },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Price is required" },
        isFloat: { msg: "Price must be a number" },
        min: {
          args: [0],
          msg: "Price must be >= 0",
        },
      },
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: "Discount must be a number" },
        min: { args: [0], msg: "Discount >= 0" },
        max: { args: [100], msg: "Discount <= 100" },
      },
    },
    color: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Color must not exceed 255 characters",
        },
      },
    },
    size: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Size must not exceed 255 characters",
        },
      },
    },
    material: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Material must not exceed 255 characters",
        },
      },
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: { args: [0], msg: "Weight must be >= 0" },
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      validate: {
        notNull: { msg: "Product ID is required" },
        isInt: { msg: "Product ID must be an integer" },
      },
    },
  },
  {
    tableName: "ProductVariants",
    timestamps: false,
  },
);

export default ProductVariant;
