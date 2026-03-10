import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { PLAYER_LEVEL } from "../constants/userConstant.js";
import User from "./user.js";

const Profile = sequelize.define(
  "Profile",
  {
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Nguyễn Văn A",
      validate: {
        notNull: { msg: "Full name is required" },
        len: {
          args: [2, 255],
          msg: "Full name must be between 2 and 255 characters",
        },
      },
    },
    dob: {
      type: DataTypes.DATE,
      defaultValue: new Date("2000-01-01"),
      allowNull: true,
      validate: {
        isDate: {
          msg: "Date of birth must be a valid date",
        },
        isBeforeToday(value) {
          if (value && new Date(value) >= new Date()) {
            throw new Error("Date of birth must be in the past");
          }
        },
      },
    },
    gender: {
      type: DataTypes.STRING(255),
      defaultValue: "male",
      allowNull: true,
      validate: {
        isIn: {
          args: [["male", "female", "other"]],
          msg: "Gender must be male, female or other",
        },
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "231 Lê Văn Chí, Phường Linh Trung, TP. Thủ Đức, TP.HCM",
      validate: {
        notNull: { msg: "Address is required" },
        len: {
          args: [0, 255],
          msg: "Address must not exceed 255 characters",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0912345678",
      validate: {
        notNull: { msg: "Phone number is required" },
        is: {
          args: /^[0-9]{9,11}$/,
          msg: "Phone number must contain 9 to 11 digits",
        },
      },
    },
    avatar: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      defaultValue:
        "https://res.cloudinary.com/dyjqsqkir/image/upload/v1757343301/istockphoto-1337144146-612x612_blyh7z.jpg",
      validate: {
        isUrl: {
          msg: "Avatar must be a valid URL",
        },
        len: {
          args: [0, 1000],
          msg: "Avatar URL must not exceed 1000 characters",
        },
      },
    },
    level: {
      type: DataTypes.ENUM(...Object.values(PLAYER_LEVEL)),
      allowNull: false,
      defaultValue: PLAYER_LEVEL.BEGINNER,
      validate: {
        notNull: { msg: "Level is required" },
        isIn: {
          args: [Object.values(PLAYER_LEVEL)],
          msg: "Invalid player level",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "Profiles",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Profile;
