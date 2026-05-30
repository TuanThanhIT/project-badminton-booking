import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import Order from "./order.js";
import ProductVariant from "./productVariant.js";
import Branch from "./branch.js";

const Feedback = sequelize.define(
  "Feedback",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: { args: [1], msg: "User ID must be positive" },
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Order, key: "id" },
      validate: {
        isInt: { msg: "Order ID must be an integer" },
        min: { args: [1], msg: "Order ID must be positive" },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: ProductVariant, key: "id" },
      validate: {
        isInt: { msg: "ProductVariant ID must be an integer" },
        min: { args: [1], msg: "ProductVariant ID must be positive" },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Branch, key: "id" },
      validate: {
        isInt: { msg: "Branch ID must be an integer" },
        min: { args: [1], msg: "Branch ID must be positive" },
      },
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: {
        notNull: { msg: "Content is required" },
        notEmpty: { msg: "Content must not be empty" },
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
        notNull: { msg: "Rating is required" },
        isInt: { msg: "Rating must be an integer" },
        min: { args: [1], msg: "Rating must be at least 1" },
        max: { args: [5], msg: "Rating must be at most 5" },
      },
    },
  },
  {
    tableName: "Feedbacks",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",

    indexes: [
      { fields: ["userId"] },
      { fields: ["orderId"] },
      { fields: ["variantId"] },
      { fields: ["branchId"] },
      { unique: true, fields: ["userId", "branchId"] },
    ],
  },
);

export default Feedback;

Feedback.beforeValidate((fb) => {
  const hasProduct = !!fb.variantId;
  const hasBranch = !!fb.branchId;

  if (!hasProduct && !hasBranch) {
    throw new Error("Feedback must target either product or branch");
  }

  if (hasProduct && hasBranch) {
    throw new Error("Feedback cannot target both product and branch");
  }

  // nếu review product thì phải gắn orderId
  if (hasProduct && !fb.orderId) {
    throw new Error("Product feedback must include orderId");
  }
});
