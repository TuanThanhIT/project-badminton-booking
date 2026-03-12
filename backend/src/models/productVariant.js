import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "./product.js";
import Branch from "./branch.js";

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
      validate: {
        notNull: { msg: "Stock is required" },
        isInt: {
          msg: "Stock must be an integer",
        },
        min: {
          args: [0],
          msg: "Stock must be greater than or equal to 0",
        },
      },
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Discount must be a number",
        },
        min: {
          args: [0],
          msg: "Discount cannot be less than 0",
        },
        max: {
          args: [100],
          msg: "Discount cannot be greater than 100",
        },
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" },
      validate: {
        notNull: {
          msg: "Product ID is required",
        },
        isInt: {
          msg: "Product ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Product ID must be a positive number",
        },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
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
  },
  {
    tableName: "ProductVariants",
    timestamps: false,
  },
);

export default ProductVariant;
