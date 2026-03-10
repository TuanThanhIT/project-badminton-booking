import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ROLE_NAME } from "../constants/userConstant.js";

const Role = sequelize.define(
  "Role",
  {
    roleName: {
      type: DataTypes.ENUM(...Object.values(ROLE_NAME)),
      unique: true,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Role name is required" },
        isIn: {
          args: [Object.values(ROLE_NAME)],
          msg: "Invalid role name",
        },
      },
    },
  },
  {
    tableName: "Roles",
    timestamps: false,
  },
);

export default Role;
