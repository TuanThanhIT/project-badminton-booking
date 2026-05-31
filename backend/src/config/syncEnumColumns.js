import { QueryTypes } from "sequelize";
import { BOOKING_STATUS } from "../constants/bookingConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";

const enumList = (values) => values.map((value) => `'${value}'`).join(",");

const getColumnNames = async (sequelize, tableName) => {
  const columns = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`, {
    type: QueryTypes.SELECT,
  });

  return new Set(columns.map((column) => column.Field));
};

const ensureWorkShiftWageColumns = async (sequelize) => {
  const columns = await getColumnNames(sequelize, "WorkShifts");

  if (!columns.has("cashierShiftWage")) {
    await sequelize.query(
      "ALTER TABLE WorkShifts ADD COLUMN cashierShiftWage DOUBLE NOT NULL DEFAULT 0",
      { type: QueryTypes.RAW },
    );
  }

  if (!columns.has("staffShiftWage")) {
    await sequelize.query(
      "ALTER TABLE WorkShifts ADD COLUMN staffShiftWage DOUBLE NOT NULL DEFAULT 0",
      { type: QueryTypes.RAW },
    );
  }

  const updatedColumns = await getColumnNames(sequelize, "WorkShifts");

  if (updatedColumns.has("shiftWage")) {
    await sequelize.query(
      `UPDATE WorkShifts
       SET cashierShiftWage = CASE WHEN cashierShiftWage = 0 THEN shiftWage ELSE cashierShiftWage END,
           staffShiftWage = CASE WHEN staffShiftWage = 0 THEN shiftWage ELSE staffShiftWage END`,
      { type: QueryTypes.RAW },
    );
  }
};

const ensureWorkShiftEmployeeColumns = async (sequelize) => {
  const columns = await getColumnNames(sequelize, "WorkShiftEmployees");

  if (!columns.has("completionRate")) {
    await sequelize.query(
      "ALTER TABLE WorkShiftEmployees ADD COLUMN completionRate DOUBLE NOT NULL DEFAULT 0",
      { type: QueryTypes.RAW },
    );
  }

  if (!columns.has("earnedWage")) {
    await sequelize.query(
      "ALTER TABLE WorkShiftEmployees ADD COLUMN earnedWage DOUBLE NULL DEFAULT 0",
      { type: QueryTypes.RAW },
    );
  }
};

export const syncEnumColumns = async (sequelize) => {
  await ensureWorkShiftWageColumns(sequelize);
  await ensureWorkShiftEmployeeColumns(sequelize);

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
