import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { CONVERSATION_TYPE } from "../constants/messageConstant.js";

const Conversation = sequelize.define(
  "Conversation",
  {
    conversationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Conversation name is required",
        },
        notEmpty: {
          msg: "Conversation name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Conversation name must not exceed 255 characters",
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
    type: {
      type: DataTypes.ENUM(...Object.values(CONVERSATION_TYPE)),
      allowNull: false,
      defaultValue: CONVERSATION_TYPE.PRIVATE,
      validate: {
        notNull: { msg: "Conversation type is required" },
        isIn: {
          args: [Object.values(CONVERSATION_TYPE)],
          msg: "Invalid conversation type",
        },
      },
    },
  },
  {
    tableName: "Conversations",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Conversation;
