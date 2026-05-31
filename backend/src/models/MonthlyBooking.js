import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import Branch from "./branch.js";
import Court from "./court.js";

const MonthlyBooking = sequelize.define(
  "MonthlyBooking",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Court, key: "id" },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Start date must be a valid date" },
      },
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "End date must be a valid date" },
      },
    },
    // Lưu danh sách các thứ: "Monday,Tuesday,..."
    // Nếu khách chơi cả tuần, truyền đủ 7 thứ vào đây.
    daysOfWeek: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Ví dụ: Monday,Wednesday,Friday hoặc full 7 ngày",
      set(value) {
        // Nếu truyền vào là Array ["Monday", "Tuesday"], tự động chuyển thành chuỗi
        if (Array.isArray(value)) {
          this.setDataValue("daysOfWeek", value.join(","));
        } else {
          this.setDataValue("daysOfWeek", value);
        }
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "Start time is required" },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "End time is required" },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Total amount cannot be negative" },
      },
    },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "COMPLETED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "MonthlyBookings",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

// RÀO LOGIC: Ngày kết thúc phải sau ngày bắt đầu
MonthlyBooking.beforeValidate((instance) => {
  if (instance.startDate && instance.endDate) {
    if (new Date(instance.startDate) >= new Date(instance.endDate)) {
      throw new Error("End date must be strictly after start date");
    }
  }
});

export default MonthlyBooking;
