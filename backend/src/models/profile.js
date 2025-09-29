import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Profile = sequelize.define(
  "Profile",
  {
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Nguyễn Văn A",
    },
    dob: {
      type: DataTypes.DATE,
      defaultValue: new Date("2000-01-01"),
    },
    gender: {
      type: DataTypes.STRING(255),
      defaultValue: "male",
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "231 Lê Văn Chí, Phường Linh Trung, TP. Thủ Đức, TP.HCM",
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0912345678",
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
