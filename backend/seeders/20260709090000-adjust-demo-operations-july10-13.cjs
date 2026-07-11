"use strict";

const MARKER = "[DEMO-SEED-3M]";
const COMPLETED_DATES = ["2026-07-10"];
const ACTIONABLE_DATES = ["2026-07-13"];

const dateListSql = (dates) => dates.map((date) => `'${date}'`).join(", ");

module.exports = {
  async up(queryInterface) {
    const completedDates = dateListSql(COMPLETED_DATES);
    const actionableDates = dateListSql(ACTIONABLE_DATES);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
        UPDATE WorkShifts
        SET shiftStatus = 'COMPLETED',
            updatedAt = NOW()
        WHERE shiftName LIKE :marker
          AND workDate IN (${completedDates})
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE WorkShiftEmployees wse
        JOIN WorkShifts ws ON ws.id = wse.workShiftId
        SET
          wse.checkIn = DATE_SUB(
            TIMESTAMP(ws.workDate, ws.startTime),
            INTERVAL CASE WHEN wse.roleInShift = 'CASHIER' THEN 8 ELSE 3 END MINUTE
          ),
          wse.checkOut = DATE_ADD(
            TIMESTAMP(ws.workDate, ws.endTime),
            INTERVAL CASE WHEN wse.roleInShift = 'CASHIER' THEN 5 ELSE 2 END MINUTE
          ),
          wse.completionRate = 1,
          wse.earnedWage = CASE
            WHEN wse.roleInShift = 'CASHIER' THEN ws.cashierShiftWage
            ELSE ws.staffShiftWage
          END,
          wse.updatedAt = NOW()
        WHERE ws.shiftName LIKE :marker
          AND ws.workDate IN (${completedDates})
          AND ws.shiftStatus = 'COMPLETED'
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        INSERT INTO CashRegisters (
          workShiftEmployeeId,
          openingCash,
          closingCash,
          expectedCash,
          difference,
          createdAt,
          updatedAt
        )
        SELECT
          wse.id,
          1000000 + (wse.id % 4) * 250000 AS openingCash,
          1000000 + (wse.id % 4) * 250000 + (wse.id % 9) * 120000 AS closingCash,
          1000000 + (wse.id % 4) * 250000 + (wse.id % 9) * 120000 AS expectedCash,
          0 AS difference,
          NOW(),
          NOW()
        FROM WorkShiftEmployees wse
        JOIN WorkShifts ws ON ws.id = wse.workShiftId
        WHERE ws.shiftName LIKE :marker
          AND ws.workDate IN (${completedDates})
          AND ws.shiftStatus = 'COMPLETED'
          AND wse.roleInShift = 'CASHIER'
          AND NOT EXISTS (
            SELECT 1
            FROM CashRegisters cr
            WHERE cr.workShiftEmployeeId = wse.id
          )
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE Bookings b
        JOIN BookingDetails bd ON bd.bookingId = b.id
        SET
          b.bookingStatus = 'COMPLETED',
          b.previousBookingStatus = NULL,
          b.cancelledBy = NULL,
          b.cancelReason = NULL,
          b.cancelRejectReason = NULL,
          b.cancelRequestedAt = NULL,
          b.cancelHandledAt = NULL,
          b.cancelledAt = NULL,
          b.updatedAt = NOW()
        WHERE b.note LIKE :marker
          AND bd.playDate IN (${completedDates})
          AND b.bookingStatus NOT IN ('CANCELLED', 'FAILED')
        `,
        { replacements: { marker: `%${MARKER} DEMO-BOOKING-%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE Payments p
        JOIN Bookings b
          ON p.targetPaymentType = 'BOOKING'
         AND p.targetPaymentId = b.id
        JOIN BookingDetails bd ON bd.bookingId = b.id
        SET
          p.paymentStatus = 'PAID',
          p.paidAt = COALESCE(p.paidAt, DATE_ADD(b.createdAt, INTERVAL 15 MINUTE)),
          p.refundAmount = NULL,
          p.refundAt = NULL
        WHERE b.note LIKE :marker
          AND bd.playDate IN (${completedDates})
          AND b.bookingStatus = 'COMPLETED'
        `,
        { replacements: { marker: `%${MARKER} DEMO-BOOKING-%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        DELETE cr
        FROM CashRegisters cr
        JOIN WorkShiftEmployees wse ON wse.id = cr.workShiftEmployeeId
        JOIN WorkShifts ws ON ws.id = wse.workShiftId
        WHERE ws.shiftName LIKE :marker
          AND ws.workDate IN (${actionableDates})
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE WorkShiftEmployees wse
        JOIN WorkShifts ws ON ws.id = wse.workShiftId
        SET
          wse.checkIn = NULL,
          wse.checkOut = NULL,
          wse.completionRate = 0,
          wse.earnedWage = 0,
          wse.updatedAt = NOW()
        WHERE ws.shiftName LIKE :marker
          AND ws.workDate IN (${actionableDates})
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE WorkShifts
        SET shiftStatus = 'SCHEDULED',
            updatedAt = NOW()
        WHERE shiftName LIKE :marker
          AND workDate IN (${actionableDates})
        `,
        { replacements: { marker: `%${MARKER}%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE TEMPORARY TABLE DemoBookingRanks AS
        SELECT
          ranked.id,
          ranked.rn
        FROM (
          SELECT
            b.id,
            ROW_NUMBER() OVER (
              PARTITION BY bd.playDate, b.branchId
              ORDER BY b.createdAt ASC, b.id ASC
            ) AS rn
          FROM Bookings b
          JOIN BookingDetails bd ON bd.bookingId = b.id
          WHERE b.note LIKE :marker
            AND bd.playDate IN (${actionableDates})
            AND b.bookingStatus NOT IN ('CANCELLED', 'FAILED')
        ) ranked
        WHERE ranked.rn <= 4
        `,
        { replacements: { marker: `%${MARKER} DEMO-BOOKING-%` }, transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE Bookings b
        JOIN DemoBookingRanks r ON r.id = b.id
        SET
          b.bookingStatus = CASE
            WHEN r.rn <= 2 THEN 'PENDING'
            ELSE 'CONFIRMED'
          END,
          b.previousBookingStatus = CASE
            WHEN r.rn <= 2 THEN NULL
            ELSE 'PENDING'
          END,
          b.cancelledBy = NULL,
          b.cancelReason = NULL,
          b.cancelRejectReason = NULL,
          b.cancelRequestedAt = NULL,
          b.cancelHandledAt = NULL,
          b.cancelledAt = NULL,
          b.updatedAt = NOW()
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        UPDATE Payments p
        JOIN DemoBookingRanks r
          ON p.targetPaymentType = 'BOOKING'
         AND p.targetPaymentId = r.id
        JOIN Bookings b ON b.id = r.id
        SET
          p.paymentStatus = CASE
            WHEN r.rn <= 2 THEN 'PENDING'
            ELSE 'PAID'
          END,
          p.paidAt = CASE
            WHEN r.rn <= 2 THEN NULL
            ELSE COALESCE(p.paidAt, DATE_ADD(b.createdAt, INTERVAL 15 MINUTE))
          END,
          p.refundAmount = NULL,
          p.refundAt = NULL
        `,
        { transaction },
      );

      await queryInterface.sequelize.query("DROP TEMPORARY TABLE DemoBookingRanks", {
        transaction,
      });
    });
  },

  async down() {
    // No-op: this seeder prepares demo state from existing generated data only.
  },
};
