import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Role from "./role.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Username is required",
        },
        notEmpty: {
          msg: "Username cannot be empty",
        },
        len: {
          args: [3, 50],
          msg: "Username must be between 3 and 50 characters",
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: "Username can only contain letters, numbers and underscore",
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required",
        },
        notEmpty: {
          msg: "Password cannot be empty",
        },
        len: {
          args: [6, 255],
          msg: "Password must be at least 6 characters",
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Email is required",
        },
        notEmpty: {
          msg: "Email cannot be empty",
        },
        isEmail: {
          msg: "Invalid email format",
        },
      },
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Role ID is required",
        },
        isInt: {
          msg: "Role ID must be an integer",
        },
      },
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default User;
