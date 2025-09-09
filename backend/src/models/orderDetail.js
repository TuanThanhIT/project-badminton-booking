import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    subTotal: { type: DataTypes.DOUBLE, allowNull: false },
    orderId: {
      type: DataTypes.INTEGER,
      references: { model: "Orders", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "OrderDetails",
    timestamps: false,
  }
);
export default OrderDetail;
