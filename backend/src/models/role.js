import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define(
  "Role",
  {
    roleName: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  },
  {
    tableName: "Roles",
    timestamps: false,
  }
);
export default Role;
