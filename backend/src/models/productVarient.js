import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductVarient = sequelize.define(
  "ProductVarient",
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
  },
  {
    tableName: "ProductVarients",
    timestamps: false,
  },
);

export default ProductVarient;
