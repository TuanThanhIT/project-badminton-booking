import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Profile = sequelize.define(
  "Profile",
  {
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Unknown",
    },
    dob: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.STRING(255),
      defaultValue: "other",
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Not provided",
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0123456789",
    },
    avatar: {
      type: DataTypes.STRING(1000),
      defaultValue:
        "https://res.cloudinary.com/dyjqsqkir/image/upload/v1757343301/istockphoto-1337144146-612x612_blyh7z.jpg", // ảnh mặc định
    },
  },
  {
    tableName: "Profiles",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);

export default Profile;
