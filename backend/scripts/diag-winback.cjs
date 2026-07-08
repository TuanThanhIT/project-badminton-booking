"use strict";

const { Sequelize, QueryTypes } = require("sequelize");
const cfg = {
  ...require("../src/config/config.cjs").production,
  host: "127.0.0.1",
  logging: false,
};
const s = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

const run = async () => {
  const [wb] = await s.query(
    "SELECT COUNT(*) AS c FROM Users WHERE username LIKE 'demo_winback_%'",
    { type: QueryTypes.SELECT },
  );
  const [bk] = await s.query(
    "SELECT COUNT(*) AS c FROM Bookings WHERE note LIKE '%AI-WINBACK%'",
    { type: QueryTypes.SELECT },
  );

  const activity = await s.query(
    `
      SELECT u.username,
             COUNT(DISTINCT b.id) AS totalBookings,
             COUNT(CASE WHEN bd.playDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN bd.id END) AS sessions30d,
             MAX(bd.playDate) AS lastPlay,
             DATEDIFF(CURDATE(), MAX(bd.playDate)) AS daysSince
      FROM Users u
      JOIN Bookings b ON b.userId = u.id
        AND b.bookingStatus IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')
      JOIN BookingDetails bd ON bd.bookingId = b.id
      WHERE u.username LIKE 'demo_winback_%'
      GROUP BY u.id, u.username
      ORDER BY u.username
    `,
    { type: QueryTypes.SELECT },
  );

  const comeback = activity.filter((r) => {
    const s30 = Number(r.sessions30d);
    const total = Number(r.totalBookings);
    const days = Number(r.daysSince);
    if (s30 !== 0) return false;
    if (total >= 2 && days > 21) return true;
    if (total === 1 && days > 7) return true;
    return false;
  });

  console.log("Winback users:", wb.c, "| AI-WINBACK bookings:", bk.c);
  console.table(activity);
  console.log("Expected comeback candidates:", comeback.length);

  // Full pipeline like backend
  process.env.AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";
  const { buildAdminInsightsPayload } = await import(
    "../src/services/aiRecommendationDataService.js"
  );
  const payload = await buildAdminInsightsPayload();
  console.log("userActivity count:", payload.userActivity.length);
  const winbackInPayload = payload.userActivity.filter((u) =>
    String(u.email || "").includes("demo_winback"),
  );
  console.log("winback in userActivity:", winbackInPayload.length);
  if (winbackInPayload[0]) console.log("sample:", winbackInPayload[0]);

  const { buildAdminInsights } = await import(
    "../src/services/adminInsightsRules.js"
  );
  const insights = buildAdminInsights(payload);
    console.log(
      "voucherActivationCandidates:",
      insights?.voucherActivationCandidates?.length ?? 0,
    );
    console.log(
      "likelyReturnCustomers:",
      insights?.likelyReturnCustomers?.length ?? 0,
    );
};

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => s.close());
