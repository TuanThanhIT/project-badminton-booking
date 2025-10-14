import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Discount = sequelize.define(
  "Discount",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // không cho trùng mã giảm
    },
    type: {
      type: DataTypes.ENUM("PERCENT", "AMOUNT"),
      allowNull: false,
      defaultValue: "AMOUNT", // mặc định giảm theo số tiền
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // số lượng mã còn lại
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // cho phép bật/tắt mã giảm giá
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true, // giá trị đơn hàng tối thiểu để áp dụng
    },
  },
  {
    tableName: "Discounts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Discount;
