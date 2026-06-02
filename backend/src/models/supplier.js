import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { SUPPLIER_STATUS } from "../constants/inventoryConstant.js";

const Supplier = sequelize.define(
  "Supplier",
  {
    supplierName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue("supplierName", value?.trim());
      },
      validate: {
        notNull: { msg: "Supplier name is required" },
        notEmpty: { msg: "Supplier name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Supplier name must be between 2 and 255 characters",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "Phone number must not exceed 20 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: "Email must be valid" },
        len: {
          args: [0, 255],
          msg: "Email must not exceed 255 characters",
        },
      },
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Address must not exceed 500 characters",
        },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: SUPPLIER_STATUS.ACTIVE,
      validate: {
        isIn: {
          args: [Object.values(SUPPLIER_STATUS)],
          msg: "Supplier status is invalid",
        },
      },
    },
  },
  {
    tableName: "Suppliers",
    timestamps: true,
    paranoid: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    indexes: [{ fields: ["status"] }, { fields: ["supplierName"] }],
  },
);

export default Supplier;
