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
      validate: {
        notNull: {
          msg: "Post ID is required",
        },
        isInt: {
          msg: "Post ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Post ID must be a positive number",
        },
      },
    },
    coachUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Coach user ID is required",
        },
        isInt: {
          msg: "Coach user ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Coach user ID must be a positive number",
        },
      },
    },
    studentUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Student user ID is required",
        },
        isInt: {
          msg: "Student user ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Student user ID must be a positive number",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ENROLLMENT_STATUS)),
      allowNull: false,
      defaultValue: ENROLLMENT_STATUS.PENDING,
      validate: {
        notNull: {
          msg: "Enrollment status is required",
        },
        isIn: {
          args: [Object.values(ENROLLMENT_STATUS)],
          msg: "Invalid enrollment status",
        },
      },
    },
    source: {
      type: DataTypes.ENUM(...Object.values(ENROLLMENT_SOURCE)),
      allowNull: false,
      defaultValue: ENROLLMENT_SOURCE.POST_REGISTER,
      validate: {
        notNull: {
          msg: "Enrollment source is required",
        },
        isIn: {
          args: [Object.values(ENROLLMENT_SOURCE)],
          msg: "Invalid enrollment source",
        },
      },
    },
    coachNote: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Coach note must not exceed 500 characters",
        },
      },
    },
    rejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Reject reason must not exceed 500 characters",
        },
      },
    },
  },
  {
    tableName: "ClassEnrollments",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["postId", "studentUserId"],
        name: "uniq_class_enrollment_post_student",
      },
    ],
    validate: {
      studentMustDifferFromCoach() {
        if (
          this.studentUserId &&
          this.coachUserId &&
          Number(this.studentUserId) === Number(this.coachUserId)
        ) {
          throw new Error("Student cannot enroll in their own class");
        }
      },
    },
  },
);

export default ClassEnrollment;
