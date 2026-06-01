import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  ENROLLMENT_SOURCE,
  ENROLLMENT_STATUS,
} from "../constants/classConstant.js";
import Post from "./post.js";
import User from "./user.js";

const ClassEnrollment = sequelize.define(
  "ClassEnrollment",
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Post, key: "id" },
    },
    coachUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    studentUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ENROLLMENT_STATUS)),
      allowNull: false,
      defaultValue: ENROLLMENT_STATUS.PENDING,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(ENROLLMENT_SOURCE)),
      allowNull: false,
      defaultValue: ENROLLMENT_SOURCE.POST_REGISTER,
    },
    coachNote: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    rejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "ClassEnrollments",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
    indexes: [
      {
        unique: true,
        fields: ["postId", "studentUserId"],
        name: "uniq_class_enrollment_post_student",
      },
    ],
  },
);

export default ClassEnrollment;
