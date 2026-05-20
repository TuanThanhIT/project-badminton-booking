import { QueryTypes } from "sequelize";
import { BOOKING_STATUS } from "../constants/bookingConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";

const enumList = (values) => values.map((value) => `'${value}'`).join(",");

export const syncEnumColumns = async (sequelize) => {
  await sequelize.query(
    `ALTER TABLE Payments MODIFY paymentStatus ENUM(${enumList(
      Object.values(PAYMENT_STATUS),
    )}) NOT NULL DEFAULT '${PAYMENT_STATUS.PENDING}'`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `ALTER TABLE Payments MODIFY paymentMethod ENUM(${enumList(
      Object.values(PAYMENT_METHOD_STATUS),
    )}) NULL`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `UPDATE Bookings SET bookingStatus = '${BOOKING_STATUS.PENDING}' WHERE bookingStatus = 'PAID'`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `ALTER TABLE Bookings MODIFY bookingStatus ENUM(${enumList(
      Object.values(BOOKING_STATUS),
    )}) NOT NULL DEFAULT '${BOOKING_STATUS.PENDING}'`,
    { type: QueryTypes.RAW },
  );
};
