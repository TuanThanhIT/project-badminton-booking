import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define(
  "Role",
  {
    roleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Role name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Role name must not exceed 255 characters",
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
