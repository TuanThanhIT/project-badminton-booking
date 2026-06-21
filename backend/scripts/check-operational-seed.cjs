"use strict";

const { Sequelize, QueryTypes } = require("sequelize");
const config = require("../src/config/config.cjs").production;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

const scalar = async (sql) => {
  const [row] = await sequelize.query(sql, { type: QueryTypes.SELECT });
  return row;
};

const run = async () => {
  const checks = {
    workShifts: await scalar(`
      SELECT COUNT(*) AS total, MIN(workDate) AS firstDate, MAX(workDate) AS lastDate
      FROM WorkShifts
      WHERE shiftName LIKE '%[DEMO-SEED-3M]%'
    `),
    bookings: await scalar(`
      SELECT COUNT(*) AS total, MIN(bd.playDate) AS firstDate, MAX(bd.playDate) AS lastDate,
             COUNT(DISTINCT bd.playDate) AS coveredDays
      FROM BookingDetails bd
      JOIN Bookings b ON b.id = bd.bookingId
      WHERE b.note LIKE '%[DEMO-SEED-3M] DEMO-BOOKING-%'
    `),
    onlineOrders: await scalar(`
      SELECT COUNT(*) AS total, MIN(o.createdAt) AS firstDate, MAX(o.createdAt) AS lastDate,
             COUNT(DISTINCT DATE(o.createdAt)) AS coveredDays
      FROM Orders o
      WHERE o.trackingCode LIKE 'BH-DEMO-%'
    `),
    counterSales: await scalar(`
      SELECT COUNT(*) AS total, MIN(createdAt) AS firstDate, MAX(createdAt) AS lastDate,
             COUNT(DISTINCT DATE(createdAt)) AS coveredDays
      FROM DraftBookings
      WHERE note LIKE '%[DEMO-SEED-3M] DEMO-COUNTER-%'
    `),
    counterProducts: await scalar(`
      SELECT COUNT(*) AS total, MIN(db.createdAt) AS firstDate, MAX(db.createdAt) AS lastDate
      FROM DraftProductItems dpi
      JOIN DraftBookings db ON db.id = dpi.draftId
      WHERE db.note LIKE '%[DEMO-SEED-3M] DEMO-COUNTER-%'
    `),
    counterBeverages: await scalar(`
      SELECT COUNT(*) AS total, MIN(db.createdAt) AS firstDate, MAX(db.createdAt) AS lastDate
      FROM DraftBeverageItems dbi
      JOIN DraftBookings db ON db.id = dbi.draftId
      WHERE db.note LIKE '%[DEMO-SEED-3M] DEMO-COUNTER-%'
    `),
    walletTransactions: await scalar(`
      SELECT COUNT(*) AS total, MIN(createdAt) AS firstDate, MAX(createdAt) AS lastDate,
             COUNT(DISTINCT DATE(createdAt)) AS coveredDays
      FROM WalletTransactions
      WHERE description LIKE '%[DEMO-SEED-3M]%'
    `),
    feedbacks: await scalar(`
      SELECT COUNT(*) AS total, MIN(createdAt) AS firstDate, MAX(createdAt) AS lastDate,
             COUNT(DISTINCT DATE(createdAt)) AS coveredDays
      FROM Feedbacks
      WHERE content LIKE '%[DEMO-SEED-3M]%'
    `),
  };

  console.table(
    Object.entries(checks).map(([source, row]) => ({ source, ...row })),
  );

  const juneTail = await sequelize.query(
    `SELECT calendar.day,
            COALESCE(b.bookings, 0) AS bookings,
            COALESCE(o.orders, 0) AS onlineOrders,
            COALESCE(c.counterSales, 0) AS counterSales,
            COALESCE(w.walletTransactions, 0) AS walletTransactions,
            COALESCE(f.feedbacks, 0) AS feedbacks
     FROM (
       SELECT DATE_ADD('2026-06-10', INTERVAL seq DAY) AS day
       FROM (
         SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
         UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
         UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
         UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
         UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
         UNION ALL SELECT 20
       ) days
     ) calendar
     LEFT JOIN (
       SELECT bd.playDate AS day, COUNT(*) AS bookings
       FROM BookingDetails bd
       JOIN Bookings b ON b.id = bd.bookingId
       WHERE b.note LIKE '%[DEMO-SEED-3M] DEMO-BOOKING-%'
       GROUP BY bd.playDate
     ) b ON b.day = calendar.day
     LEFT JOIN (
       SELECT DATE(createdAt) AS day, COUNT(*) AS orders
       FROM Orders
       WHERE trackingCode LIKE 'BH-DEMO-%'
       GROUP BY DATE(createdAt)
     ) o ON o.day = calendar.day
     LEFT JOIN (
       SELECT DATE(createdAt) AS day, COUNT(*) AS counterSales
       FROM DraftBookings
       WHERE note LIKE '%[DEMO-SEED-3M] DEMO-COUNTER-%'
       GROUP BY DATE(createdAt)
     ) c ON c.day = calendar.day
     LEFT JOIN (
       SELECT DATE(createdAt) AS day, COUNT(*) AS walletTransactions
       FROM WalletTransactions
       WHERE description LIKE '%[DEMO-SEED-3M]%'
       GROUP BY DATE(createdAt)
     ) w ON w.day = calendar.day
     LEFT JOIN (
       SELECT DATE(createdAt) AS day, COUNT(*) AS feedbacks
       FROM Feedbacks
       WHERE content LIKE '%[DEMO-SEED-3M]%'
       GROUP BY DATE(createdAt)
     ) f ON f.day = calendar.day
     ORDER BY calendar.day`,
    { type: QueryTypes.SELECT },
  );

  console.table(juneTail);

  const feedbackByMonth = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month,
            SUM(variantId IS NOT NULL) AS productFeedbacks,
            SUM(branchId IS NOT NULL) AS branchFeedbacks,
            ROUND(AVG(rating), 2) AS averageRating
     FROM Feedbacks
     WHERE content LIKE '%[DEMO-SEED-3M]%'
     GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
     ORDER BY month`,
    { type: QueryTypes.SELECT },
  );

  const feedbackErrors = await scalar(`
    SELECT
      SUM(f.variantId IS NOT NULL AND (
        o.id IS NULL OR o.orderStatus <> 'COMPLETED' OR og.userId <> f.userId
      )) AS invalidProductTargets,
      SUM(f.branchId IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM Bookings b
        WHERE b.userId = f.userId
          AND b.branchId = f.branchId
          AND b.bookingStatus = 'COMPLETED'
        UNION ALL
        SELECT 1
        FROM Orders bo
        JOIN OrderGroups bog ON bog.id = bo.orderGroupId
        WHERE bog.userId = f.userId
          AND bo.branchId = f.branchId
          AND bo.orderStatus = 'COMPLETED'
      )) AS invalidBranchTargets,
      SUM(f.variantId IS NOT NULL AND f.createdAt < COALESCE(o.deliveredAt, DATE_ADD(o.createdAt, INTERVAL 3 DAY))) AS feedbackBeforeDelivery
    FROM Feedbacks f
    LEFT JOIN Orders o ON o.id = f.orderId
    LEFT JOIN OrderGroups og ON og.id = o.orderGroupId
    WHERE f.content LIKE '%[DEMO-SEED-3M]%'
  `);

  console.table(feedbackByMonth);
  console.log(feedbackErrors);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
