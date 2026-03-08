import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { DAY_OF_WEEK, PERIOD_TYPE } from "../constants/courtConstant.js";

const CourtPrice = sequelize.define(
  "CourtPrice",
  {
    dayOfWeek: {
      type: DataTypes.ENUM(...Object.values(DAY_OF_WEEK)),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Day of week is required",
        },
        isIn: {
          args: [Object.values(DAY_OF_WEEK)],
          msg: "Day of week must be a valid weekday",
        },
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Start time is required",
        },
        is: {
          args: /^\d{2}:\d{2}$/,
          msg: "Start time must be in HH:mm format",
        },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: {
          msg: "End time is required",
        },
        is: {
          args: /^\d{2}:\d{2}$/,
          msg: "End time must be in HH:mm format",
        },
      },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Price must be a number",
        },
        min: {
          args: [0],
          msg: "Price must be greater than or equal to 0",
        },
      },
    },
    periodType: {
      type: DataTypes.ENUM(...Object.values(PERIOD_TYPE)),
      allowNull: false,
      defaultValue: PERIOD_TYPE.DAYTIME,
      validate: {
        notNull: {
          msg: "Period type is required",
        },
        isIn: {
          args: [Object.values(PERIOD_TYPE)],
          msg: "Period type must be Daytime, Evening, or Weekend",
        },
      },
    },
  },
  {
    tableName: "CourtPrices",
    timestamps: false,
  },
);

export default CourtPrice;
