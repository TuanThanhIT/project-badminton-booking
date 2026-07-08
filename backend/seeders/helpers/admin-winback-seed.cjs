"use strict";

/**
 * Seed khách cho mục Admin AI: "Khách nên mời quay lại".
 *
 * Điều kiện (ai-service/app/insights/admin_rules.py):
 * - sessionsLast30Days === 0  → mọi playDate phải > 30 ngày trước (không đặt trong 30 ngày gần nhất)
 * - churn_risk: totalBookings >= 2 và daysSinceLastBooking > 21
 * - second_booking_nudge: totalBookings === 1 và daysSinceLastBooking > 7
 * - bookingStatus ∈ CONFIRMED | CHECKED_IN | COMPLETED
 *
 * Marker: [DEMO-SEED-3M] AI-WINBACK
 */

const bcrypt = require("bcrypt");
const u = require("./demo-3m-utils.cjs");
const { getBase, priceFor } = require("./demo-3m-phases.cjs");

const WINBACK_TAG = `${u.MARKER} AI-WINBACK`;

const today = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};

const daysAgo = (n) => u.addDays(today(), -n);

/** Mỗi user: { kind, fullName, bookings: [{ daysAgo, hour }] } */
const WINBACK_PERSONAS = [
  // churn_risk — ≥2 lần đặt, lần cuối 32–45 ngày (ngoài cửa sổ 30 ngày)
  {
    kind: "churn",
    username: "demo_winback_churn_001",
    fullName: "Nguyễn Văn Long",
    bookings: [
      { daysBack: 95, hour: 18 },
      { daysBack: 62, hour: 19 },
      { daysBack: 38, hour: 20 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_002",
    fullName: "Trần Thị Mai",
    bookings: [
      { daysBack: 88, hour: 17 },
      { daysBack: 55, hour: 18 },
      { daysBack: 35, hour: 19 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_003",
    fullName: "Lê Hoàng Phúc",
    bookings: [
      { daysBack: 72, hour: 20 },
      { daysBack: 42, hour: 19 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_004",
    fullName: "Phạm Minh Tuấn",
    bookings: [
      { daysBack: 110, hour: 18 },
      { daysBack: 78, hour: 19 },
      { daysBack: 45, hour: 20 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_005",
    fullName: "Võ Thanh Hà",
    bookings: [
      { daysBack: 65, hour: 17 },
      { daysBack: 33, hour: 18 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_006",
    fullName: "Đặng Quốc Bình",
    bookings: [
      { daysBack: 90, hour: 19 },
      { daysBack: 58, hour: 20 },
      { daysBack: 40, hour: 18 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_007",
    fullName: "Bùi Ngọc Lan",
    bookings: [
      { daysBack: 80, hour: 18 },
      { daysBack: 36, hour: 19 },
    ],
  },
  {
    kind: "churn",
    username: "demo_winback_churn_008",
    fullName: "Hoàng Đức An",
    bookings: [
      { daysBack: 100, hour: 20 },
      { daysBack: 70, hour: 19 },
      { daysBack: 44, hour: 18 },
    ],
  },
  // second_booking_nudge — đúng 1 lần, >7 ngày và >30 ngày
  {
    kind: "nudge",
    username: "demo_winback_nudge_001",
    fullName: "Ngô Thùy Linh",
    bookings: [{ daysBack: 40, hour: 18 }],
  },
  {
    kind: "nudge",
    username: "demo_winback_nudge_002",
    fullName: "Mai Quang Huy",
    bookings: [{ daysBack: 35, hour: 19 }],
  },
  {
    kind: "nudge",
    username: "demo_winback_nudge_003",
    fullName: "Cao Thị Hồng",
    bookings: [{ daysBack: 50, hour: 17 }],
  },
  {
    kind: "nudge",
    username: "demo_winback_nudge_004",
    fullName: "Trương Bảo Nam",
    bookings: [{ daysBack: 32, hour: 20 }],
  },
];

const deleteWinbackBookings = async (qi, Sequelize, transaction) => {
  const rows = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Bookings WHERE note LIKE :note",
    { note: `${WINBACK_TAG}%` },
    transaction,
  );
  const ids = rows.map((r) => Number(r.id));
  if (!ids.length) return;
  await u.del(qi, "BookingDetails", { bookingId: ids }, transaction);
  await u.del(qi, "Bookings", { id: ids }, transaction);
};

/** Bulk/demo seed từng gán nhầm booking cho demo_winback_* — xóa hết trừ AI-WINBACK. */
const purgeForeignBookingsForWinbackUsers = async (qi, Sequelize, transaction) => {
  const users = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Users WHERE username LIKE 'demo\\_winback\\_%'",
    {},
    transaction,
  );
  const userIds = users.map((r) => Number(r.id));
  if (!userIds.length) return 0;

  const foreign = await u.q(
    qi,
    Sequelize,
    `
      SELECT id FROM Bookings
      WHERE userId IN (:userIds)
        AND (note IS NULL OR note NOT LIKE :winbackTag)
    `,
    { userIds, winbackTag: `${WINBACK_TAG}%` },
    transaction,
  );
  const bookingIds = foreign.map((r) => Number(r.id));
  if (!bookingIds.length) return 0;

  await u.del(qi, "BookingDetails", { bookingId: bookingIds }, transaction);
  await u.del(qi, "Bookings", { id: bookingIds }, transaction);
  return bookingIds.length;
};

const deleteWinbackUsers = async (qi, Sequelize, transaction) => {
  const users = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Users WHERE username LIKE 'demo\\_winback\\_%'",
    {},
    transaction,
  );
  const ids = users.map((r) => Number(r.id));
  if (!ids.length) return;
  await u.del(qi, "Profiles", { userId: ids }, transaction);
  await u.del(qi, "Users", { id: ids }, transaction);
};

const ensureWinbackUsers = async (qi, Sequelize, transaction) => {
  const roleRows = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Roles WHERE roleName = 'USER' LIMIT 1",
    {},
    transaction,
  );
  const roleId = Number(roleRows[0]?.id);
  if (!roleId) throw new Error("Không tìm thấy role USER");

  const password = await bcrypt.hash(
    process.env.DEMO_PASSWORD || "@Demo123456",
    10,
  );

  const existing = await u.q(
    qi,
    Sequelize,
    "SELECT username, id FROM Users WHERE username LIKE 'demo\\_winback\\_%'",
    {},
    transaction,
  );
  const byUsername = new Map(existing.map((r) => [r.username, Number(r.id)]));

  const usersToInsert = [];
  const profilesToInsert = [];

  WINBACK_PERSONAS.forEach((persona, idx) => {
    if (byUsername.has(persona.username)) return;
    const email = `${persona.username}@bhub.local`;
    const now = u.dateTime(daysAgo(120 + idx), 10, 0);
    usersToInsert.push({
      username: persona.username,
      email,
      password,
      isVerified: true,
      isActive: true,
      isOnline: false,
      lastSeenAt: now,
      accountStatus: "ACTIVE",
      suspendedUntil: null,
      suspensionReason: null,
      violationCount: 0,
      lastViolationAt: null,
      roleId,
      createdAt: now,
      updatedAt: now,
    });
    profilesToInsert.push({
      username: persona.username,
      fullName: persona.fullName,
      dob: new Date(1990 + (idx % 8), idx % 12, (idx % 27) + 1),
      gender: idx % 2 === 0 ? "male" : "female",
      address: u.pick(u.addresses).address,
      phoneNumber: `09${String(71000000 + idx).slice(-8)}`,
      avatar: u.avatar,
      level: "INTERMEDIATE",
      createdAt: now,
      updatedAt: now,
    });
  });

  if (usersToInsert.length) {
    await u.insert(qi, "Users", usersToInsert, transaction);
    const inserted = await u.q(
      qi,
      Sequelize,
      "SELECT id, username FROM Users WHERE username LIKE 'demo\\_winback\\_%'",
      {},
      transaction,
    );
    const idByUsername = new Map(
      inserted.map((r) => [r.username, Number(r.id)]),
    );
    await u.insert(
      qi,
      "Profiles",
      profilesToInsert
        .map((p) => ({
          userId: idByUsername.get(p.username),
          fullName: p.fullName,
          dob: p.dob,
          gender: p.gender,
          address: p.address,
          phoneNumber: p.phoneNumber,
          avatar: p.avatar,
          level: p.level,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }))
        .filter((p) => p.userId),
      transaction,
    );
  }

  const all = await u.q(
    qi,
    Sequelize,
    `
      SELECT u.id, u.username, p.fullName
      FROM Users u
      LEFT JOIN Profiles p ON p.userId = u.id
      WHERE u.username LIKE 'demo\\_winback\\_%'
      ORDER BY u.username
    `,
    {},
    transaction,
  );

  return new Map(all.map((r) => [r.username, r]));
};

const seedAdminWinbackCustomers = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    const purged = await purgeForeignBookingsForWinbackUsers(qi, Sequelize, transaction);
    await deleteWinbackBookings(qi, Sequelize, transaction);

    const base = await getBase(qi, Sequelize, transaction);
    if (!base.branches.length || !base.courts.length) {
      return { ok: false, reason: "missing_branches_or_courts" };
    }

    const userMap = await ensureWinbackUsers(qi, Sequelize, transaction);
    const courtsByBranch = base.courts.reduce((acc, court) => {
      (acc[court.branchId] = acc[court.branchId] || []).push(court);
      return acc;
    }, {});

    const occupied = new Set();
    const existingRows = await u.q(
      qi,
      Sequelize,
      `
        SELECT bd.courtId,
               DATE_FORMAT(bd.playDate, '%Y-%m-%d') AS playDate,
               HOUR(bd.startTime) AS hour
        FROM BookingDetails bd
        WHERE bd.playDate >= :since
      `,
      { since: u.dateOnly(daysAgo(120)) },
      transaction,
    );
    existingRows.forEach((row) => {
      occupied.add(`${row.courtId}-${row.playDate}-${row.hour}`);
    });

    const bookings = [];
    const detailsMeta = [];
    let seq = 0;

    const reserveSlot = (courtId, playDate, hour) => {
      const key = `${courtId}-${u.dateOnly(playDate)}-${hour}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
      return true;
    };

    WINBACK_PERSONAS.forEach((persona, personaIdx) => {
      const user = userMap.get(persona.username);
      if (!user) return;

      const branch = base.branches[personaIdx % base.branches.length];
      const courts = courtsByBranch[branch.id] || base.courts;

      persona.bookings.forEach((slot, slotIdx) => {
        const playDate = daysAgo(slot.daysBack);
        const hour = slot.hour;
        const court = courts[(personaIdx + slotIdx) % courts.length];
        if (!reserveSlot(court.id, playDate, hour)) return;

        seq += 1;
        const marker = `WB-${persona.kind.toUpperCase()}-${u.pad(personaIdx + 1, 2)}-${u.pad(seq, 4)}`;
        const price = priceFor(base.prices, branch.id, playDate, hour, hour + 1);
        const createdAt = u.addDays(
          u.dateTime(playDate, Math.max(6, hour - 2), 15),
          -2,
        );

        bookings.push({
          bookingStatus: "COMPLETED",
          previousBookingStatus: null,
          totalAmount: price,
          branchId: branch.id,
          userId: user.id,
          discountId: null,
          note: `${WINBACK_TAG} ${marker}`,
          cancelledBy: null,
          cancelReason: null,
          cancelRejectReason: null,
          cancelRequestedAt: null,
          cancelHandledAt: null,
          cancelledAt: null,
          createdAt,
          updatedAt: u.addMinutes(createdAt, 45),
        });

        detailsMeta.push({
          marker,
          courtId: court.id,
          playDate: u.dateOnly(playDate),
          startTime: u.time(hour),
          endTime: u.time(hour + 1),
          price,
        });
      });
    });

    await u.insert(qi, "Bookings", bookings, transaction);

    const dbBookings = await u.q(
      qi,
      Sequelize,
      "SELECT id, note FROM Bookings WHERE note LIKE :note",
      { note: `${WINBACK_TAG}%` },
      transaction,
    );
    const byMarker = new Map(
      dbBookings.map((b) => {
        const parts = String(b.note).trim().split(/\s+/);
        return [parts[parts.length - 1], b];
      }),
    );

    await u.insert(
      qi,
      "BookingDetails",
      detailsMeta
        .map((d) => ({
          bookingId: byMarker.get(d.marker)?.id,
          monthlyBookingId: null,
          courtId: d.courtId,
          playDate: d.playDate,
          startTime: d.startTime,
          endTime: d.endTime,
          price: d.price,
        }))
        .filter((d) => d.bookingId),
      transaction,
    );

    const churnCount = WINBACK_PERSONAS.filter((p) => p.kind === "churn").length;
    const nudgeCount = WINBACK_PERSONAS.filter((p) => p.kind === "nudge").length;

    return {
      ok: true,
      tag: WINBACK_TAG,
      purgedForeignBookings: purged,
      users: WINBACK_PERSONAS.length,
      churnCandidates: churnCount,
      secondBookingNudgeCandidates: nudgeCount,
      bookings: bookings.length,
      hint: "Vào Admin → AI Insights → bấm Làm mới để thấy Khách nên mời quay lại",
    };
  });

const downAdminWinbackCustomers = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteWinbackBookings(qi, Sequelize, transaction);
    await deleteWinbackUsers(qi, Sequelize, transaction);
  });

module.exports = {
  WINBACK_TAG,
  seedAdminWinbackCustomers,
  downAdminWinbackCustomers,
};
