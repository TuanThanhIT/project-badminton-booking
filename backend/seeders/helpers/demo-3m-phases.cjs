"use strict";

const u = require("./demo-3m-utils.cjs");

const paymentPrefix = async (qi, prefix, transaction) => {
  const payments = await qi.sequelize.query("SELECT id FROM Payments WHERE externalId LIKE :prefix", {
    type: require("sequelize").QueryTypes.SELECT,
    replacements: { prefix: `${prefix}%` },
    transaction,
  });
  const ids = payments.map((row) => Number(row.id));
  if (ids.length) await u.del(qi, "WalletTransactions", { paymentId: ids }, transaction);
  if (ids.length) await u.del(qi, "Payments", { id: ids }, transaction);
};

const getBase = async (qi, Sequelize, transaction) => {
  const [branches, courts, prices, variants, beverages, managers, employees] = await Promise.all([
    u.q(qi, Sequelize, "SELECT * FROM Branches ORDER BY id", {}, transaction),
    u.q(qi, Sequelize, "SELECT * FROM Courts WHERE courtStatus = 'ACTIVE' ORDER BY id", {}, transaction),
    u.q(qi, Sequelize, "SELECT * FROM CourtPrices ORDER BY id", {}, transaction),
    u.q(qi, Sequelize, `
      SELECT pv.*, p.productName, p.thumbnailUrl, vs.branchId, vs.stock
      FROM ProductVariants pv
      JOIN Products p ON p.id = pv.productId
      JOIN VariantStocks vs ON vs.variantId = pv.id
      WHERE vs.stock > 0
      ORDER BY pv.id
    `, {}, transaction),
    u.q(qi, Sequelize, `
      SELECT b.*, bs.branchId, bs.stock AS branchStock
      FROM Beverages b
      JOIN BeverageStocks bs ON bs.beverageId = b.id
      WHERE bs.stock > 0
      ORDER BY b.id
    `, {}, transaction),
    u.q(qi, Sequelize, `
      SELECT u.id, bm.branchId
      FROM Users u
      JOIN Roles r ON r.id = u.roleId AND r.roleName IN ('MANAGER', 'ADMIN')
      LEFT JOIN BranchManagers bm ON bm.managerId = u.id
      ORDER BY u.id
    `, {}, transaction),
    u.q(qi, Sequelize, `
      SELECT u.id, be.branchId
      FROM Users u
      JOIN Roles r ON r.id = u.roleId AND r.roleName = 'EMPLOYEE'
      JOIN BranchEmployees be ON be.employeeId = u.id
      ORDER BY u.id
    `, {}, transaction),
  ]);
  return { branches, courts, prices, variants, beverages, managers, employees };
};

const priceFor = (prices, branchId, date, startHour, endHour) => {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const day = days[new Date(date).getDay()];
  const rows = prices.filter((p) => Number(p.branchId) === Number(branchId) && String(p.dayOfWeek).toUpperCase() === day);
  const fallback = rows[0] || { price: 120000 };
  return u.money((endHour - startHour) * Number(fallback.price || 120000));
};

const seedUsers = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const roleIds = await u.getRoleIds(qi, Sequelize, transaction);
  const branches = await u.q(qi, Sequelize, "SELECT id FROM Branches ORDER BY id", {}, transaction);
  const existing = await u.q(qi, Sequelize, "SELECT username, email FROM Users", {}, transaction);
  const existingSet = new Set(existing.flatMap((row) => [row.username, row.email]));
  const roleCounts = await u.q(qi, Sequelize, `
    SELECT r.roleName, COUNT(*) AS total
    FROM Users u JOIN Roles r ON r.id = u.roleId
    GROUP BY r.roleName
  `, {}, transaction);
  const counts = Object.fromEntries(roleCounts.map((row) => [row.roleName, Number(row.total)]));
  const targets = { USER: 200, EMPLOYEE: 50, COACH: 15 };
  const groups = [
    { role: "USER", prefix: "demo_customer_", email: "demo.customer", start: counts.USER || 0 },
    { role: "EMPLOYEE", prefix: "demo_employee_", email: "demo.employee", start: counts.EMPLOYEE || 0 },
    { role: "COACH", prefix: "demo_coach_", email: "demo.coach", start: counts.COACH || 0 },
  ];
  const password = await u.bcrypt.hash(process.env.DEMO_PASSWORD || "@Demo123456", 10);
  const users = [];
  const profiles = [];

  for (const group of groups) {
    const missing = Math.max(0, targets[group.role] - (counts[group.role] || 0));
    for (let i = 1; i <= missing; i += 1) {
      const number = group.start + i;
      const username = `${group.prefix}${u.pad(number)}`;
      const email = `${group.email}${u.pad(number)}@bhub.local`;
      if (existingSet.has(username) || existingSet.has(email)) continue;
      const now = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
      const name = `${u.pick(u.names)} ${u.pad(number)}`;
      const phone = `09${String(40000000 + number + (group.role === "EMPLOYEE" ? 10000 : group.role === "COACH" ? 20000 : 0)).slice(-8)}`;
      users.push({ username, email, password, isVerified: true, isActive: true, isOnline: false, lastSeenAt: now, roleId: roleIds[group.role], createdAt: now, updatedAt: now });
      profiles.push({ username, fullName: name, dob: new Date(u.int(1985, 2006), u.int(0, 11), u.int(1, 28)), gender: u.weighted([["male", 48], ["female", 48], ["other", 4]]), address: u.pick(u.addresses).address, phoneNumber: phone, avatar: u.avatar, level: u.weighted([["BEGINNER", 50], ["INTERMEDIATE", 35], ["ADVANCED", 15]]), createdAt: now, updatedAt: now });
    }
  }

  await u.insert(qi, "Users", users, transaction);
  const inserted = await u.q(qi, Sequelize, "SELECT id, username FROM Users WHERE username LIKE 'demo\\_%'", {}, transaction);
  const idByUsername = new Map(inserted.map((row) => [row.username, Number(row.id)]));
  await u.insert(qi, "Profiles", profiles.map(({ username, ...row }) => ({ ...row, userId: idByUsername.get(username) })).filter((row) => row.userId), transaction);

  const demoEmployees = inserted.filter((row) => row.username.startsWith("demo_employee_"));
  const existingBranchEmployees = await u.q(qi, Sequelize, "SELECT branchId, employeeId FROM BranchEmployees WHERE employeeId IN (:ids)", { ids: demoEmployees.map((row) => row.id) }, transaction);
  const existingBranchEmployeeSet = new Set(existingBranchEmployees.map((row) => `${row.branchId}-${row.employeeId}`));
  const branchEmployees = demoEmployees
    .map((row, index) => ({ branchId: branches[index % branches.length].id, employeeId: row.id }))
    .filter((row) => !existingBranchEmployeeSet.has(`${row.branchId}-${row.employeeId}`));
  await u.insert(qi, "BranchEmployees", branchEmployees, transaction);

  const demoCoaches = inserted.filter((row) => row.username.startsWith("demo_coach_"));
  await u.del(qi, "CoachApplications", { introduction: { [Sequelize.Op.like]: `%${u.MARKER}%` } }, transaction);
  const applications = demoCoaches.map((row, index) => {
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    return {
      userId: row.id,
      status: "APPROVED",
      experienceYears: 2 + (index % 9),
      certificate: `Demo coaching certificate ${u.pad(index + 1)}`,
      certificateImages: JSON.stringify([`https://placehold.co/800x600/png?text=Coach+Certificate+${u.pad(index + 1)}`]),
      introduction: `${u.MARKER} Coach demo phu hop lop cau long co ban va nang cao.`,
      phoneContact: `0988${String(100000 + index).slice(-6)}`,
      reviewedBy: null,
      reviewedAt: u.addDays(createdAt, 2),
      createdAt,
      updatedAt: u.addDays(createdAt, 2),
    };
  });
  await u.insert(qi, "CoachApplications", applications, transaction);
  const existingCoachProfiles = await u.q(qi, Sequelize, "SELECT userId FROM CoachProfiles WHERE userId IN (:ids)", { ids: demoCoaches.map((row) => row.id) }, transaction);
  const existingCoachProfileSet = new Set(existingCoachProfiles.map((row) => Number(row.userId)));
  await u.insert(qi, "CoachProfiles", demoCoaches.filter((row) => !existingCoachProfileSet.has(Number(row.id))).map((row, index) => {
    const now = u.dateTime(u.randomDate(), u.publicHour(), 0);
    return {
      userId: row.id,
      experienceYears: 2 + (index % 9),
      certificate: `Demo coaching profile ${u.pad(index + 1)}`,
      certificateImages: JSON.stringify([`https://placehold.co/800x600/png?text=Coach+Profile+${u.pad(index + 1)}`]),
      introduction: `${u.MARKER} Huan luyen vien demo co kinh nghiem huong dan phong trao.`,
      createdAt: now,
      updatedAt: now,
    };
  }), transaction);
});

const downUsers = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await u.cleanupUsers(qi, transaction);
});

const seedWalletAddress = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-WALLET-", transaction);
  const users = await u.getDemoUsers(qi, Sequelize, transaction);
  const customers = users.filter((row) => row.roleName === "USER");
  const walletUsers = users.filter((_, index) => index % 3 !== 1);

  await u.del(qi, "UserAddresses", { userId: customers.map((row) => row.id) }, transaction);
  const addresses = [];
  customers.forEach((user, index) => {
    if (index % 4 === 0) return;
    const count = index % 9 === 0 ? 3 : index % 5 === 0 ? 2 : 1;
    for (let i = 0; i < count; i += 1) {
      const a = u.addresses[(index + i) % u.addresses.length];
      const now = u.dateTime(u.randomDate(), u.publicHour(), i * 5);
      addresses.push({
        fullName: user.fullName || u.pick(u.names),
        phoneNumber: user.phoneNumber || `0977${u.pad(index, 6)}`,
        address: `${a.address} ${i + 1}`,
        provinceName: a.provinceName,
        districtName: a.districtName,
        wardName: a.wardName,
        provinceId: a.provinceId,
        districtId: a.districtId,
        wardCode: a.wardCode,
        latitude: a.latitude,
        longitude: a.longitude,
        isDefault: i === 0,
        label: i === 1 ? "OFFICE" : "HOME",
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      });
    }
  });
  await u.insert(qi, "UserAddresses", addresses, transaction);

  const existingWallets = await u.q(qi, Sequelize, "SELECT userId FROM Wallets", {}, transaction);
  const walletSet = new Set(existingWallets.map((row) => Number(row.userId)));
  await u.insert(qi, "Wallets", walletUsers.filter((row) => !walletSet.has(Number(row.id))).map((row) => {
    const now = u.dateTime(u.randomDate(), 9, 0);
    return { userId: row.id, balance: 0, status: "ACTIVE", createdAt: now, updatedAt: now };
  }), transaction);

  const wallets = await u.q(qi, Sequelize, `
    SELECT w.*, u.username FROM Wallets w JOIN Users u ON u.id = w.userId
    WHERE u.username LIKE 'demo\\_%'
  `, {}, transaction);
  const payments = [];
  wallets.forEach((wallet, index) => {
    if (index % 5 === 0) return;
    const createdAt = u.dateTime(u.randomDate(), u.int(8, 21), u.int(0, 59));
    const amount = u.pick([100000, 200000, 300000, 500000, 1000000]);
    payments.push({ walletId: wallet.id, amount, createdAt });
  });
  await u.insert(qi, "Payments", payments.map((p, i) => ({
    paymentAmount: p.amount,
    paymentMethod: "VNPAY",
    paymentStatus: "PAID",
    transId: `DEMO-PAY-WALLET-${u.pad(i + 1, 5)}`,
    externalId: `DEMO-EXT-WALLET-${u.pad(i + 1, 5)}`,
    paidAt: u.addMinutes(p.createdAt, 5),
    refundAmount: null,
    refundAt: null,
    targetPaymentType: "WALLET_TOPUP",
    targetPaymentId: p.walletId,
  })), transaction);
  const dbPayments = await u.q(qi, Sequelize, "SELECT id, targetPaymentId, paymentAmount, paidAt FROM Payments WHERE externalId LIKE 'DEMO-EXT-WALLET-%'", {}, transaction);
  await u.insert(qi, "WalletTransactions", dbPayments.map((p) => ({
    walletId: p.targetPaymentId,
    paymentId: p.id,
    withdrawRequestId: null,
    amount: p.paymentAmount,
    type: "DEPOSIT",
    status: "SUCCESS",
    expiredAt: null,
    description: `${u.MARKER} Nap vi demo`,
    createdAt: p.paidAt,
    updatedAt: p.paidAt,
  })), transaction);
  await u.exec(qi, `
    UPDATE Wallets w
    JOIN (
      SELECT walletId, SUM(amount) AS balance
      FROM WalletTransactions
      WHERE status = 'SUCCESS' AND type IN ('DEPOSIT','REFUND')
      GROUP BY walletId
    ) t ON t.walletId = w.id
    SET w.balance = t.balance, w.updatedAt = NOW()
    WHERE w.userId IN (SELECT id FROM Users WHERE username LIKE 'demo\\_%')
  `, {}, transaction);
});

const downWalletAddress = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-WALLET-", transaction);
  const users = await u.getDemoUsers(qi, Sequelize, transaction);
  const ids = users.map((row) => Number(row.id));
  if (ids.length) await u.del(qi, "UserAddresses", { userId: ids }, transaction);
});

const seedWorkShifts = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const old = await u.q(qi, Sequelize, "SELECT id FROM WorkShifts WHERE shiftName LIKE :name", { name: `%${u.MARKER}%` }, transaction);
  const oldIds = old.map((row) => Number(row.id));
  if (oldIds.length) {
    const wse = await u.q(qi, Sequelize, "SELECT id FROM WorkShiftEmployees WHERE workShiftId IN (:ids)", { ids: oldIds }, transaction);
    const wseIds = wse.map((row) => Number(row.id));
    if (wseIds.length) await u.del(qi, "CashRegisters", { workShiftEmployeeId: wseIds }, transaction);
    await u.del(qi, "WorkShiftEmployees", { workShiftId: oldIds }, transaction);
    await u.del(qi, "WorkShifts", { id: oldIds }, transaction);
  }
  const base = await getBase(qi, Sequelize, transaction);
  const shifts = [];
  for (let d = new Date(u.START); d <= u.END; d = u.addDays(d, 1)) {
    base.branches.forEach((branch) => {
      [["Morning", 6, 14], ["Evening", 14, 22]].forEach(([label, start, end]) => {
        const isNear = d > new Date("2026-06-07T00:00:00+07:00");
        shifts.push({
          shiftName: `${u.MARKER} ${label} ${branch.branchName} ${u.dateOnly(d)}`,
          workDate: u.dateOnly(d),
          startTime: `${u.time(start)}:00`,
          endTime: `${u.time(end)}:00`,
          cashierShiftWage: 280000,
          staffShiftWage: 240000,
          branchId: branch.id,
          shiftStatus: isNear ? "SCHEDULED" : (u.rand() < 0.025 ? "CANCELLED" : "COMPLETED"),
          createdAt: u.dateTime(d, start - 1, 40),
          updatedAt: u.dateTime(d, end, 10),
        });
      });
    });
  }
  await u.insert(qi, "WorkShifts", shifts, transaction);
  const dbShifts = await u.q(qi, Sequelize, "SELECT * FROM WorkShifts WHERE shiftName LIKE :name ORDER BY id", { name: `%${u.MARKER}%` }, transaction);
  const employeesByBranch = base.employees.reduce((acc, emp) => {
    acc[emp.branchId] = acc[emp.branchId] || [];
    acc[emp.branchId].push(emp.id);
    return acc;
  }, {});
  const assignments = [];
  dbShifts.forEach((shift, index) => {
    const pool = employeesByBranch[shift.branchId] || base.employees.map((e) => e.id);
    const count = shift.shiftStatus === "CANCELLED" ? 1 : (new Date(shift.workDate).getDay() % 6 === 0 ? 4 : 3);
    for (let i = 0; i < Math.min(count, pool.length); i += 1) {
      const isCashier = i === 0;
      const start = u.dateTime(shift.workDate, Number(String(shift.startTime).slice(0, 2)), u.int(0, 8));
      const end = u.dateTime(shift.workDate, Number(String(shift.endTime).slice(0, 2)), -u.int(0, 8));
      const cancelled = shift.shiftStatus === "CANCELLED";
      assignments.push({
        workShiftId: shift.id,
        employeeId: pool[(index + i) % pool.length],
        roleInShift: isCashier ? "CASHIER" : "STAFF",
        checkIn: cancelled ? null : start,
        checkOut: cancelled ? null : end,
        completionRate: cancelled ? 0 : 1,
        earnedWage: cancelled ? 0 : (isCashier ? shift.cashierShiftWage : shift.staffShiftWage),
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
      });
    }
  });
  await u.insert(qi, "WorkShiftEmployees", assignments, transaction);
  const cashiers = await u.q(qi, Sequelize, `
    SELECT wse.id, ws.workDate, ws.shiftStatus FROM WorkShiftEmployees wse
    JOIN WorkShifts ws ON ws.id = wse.workShiftId
    WHERE ws.shiftName LIKE :name AND wse.roleInShift = 'CASHIER'
  `, { name: `%${u.MARKER}%` }, transaction);
  await u.insert(qi, "CashRegisters", cashiers.filter((c) => c.shiftStatus !== "CANCELLED").map((c, i) => {
    const opening = 1000000 + (i % 4) * 250000;
    const expected = opening + (i % 9) * 120000;
    return { workShiftEmployeeId: c.id, openingCash: opening, closingCash: expected + (i % 5 - 2) * 5000, expectedCash: expected, difference: (i % 5 - 2) * 5000, createdAt: u.dateTime(c.workDate, 6, 0), updatedAt: u.dateTime(c.workDate, 22, 10) };
  }), transaction);
});

const downWorkShifts = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const rows = await u.q(qi, Sequelize, "SELECT id FROM WorkShifts WHERE shiftName LIKE :name", { name: `%${u.MARKER}%` }, transaction);
  const ids = rows.map((r) => Number(r.id));
  if (!ids.length) return;
  const wse = await u.q(qi, Sequelize, "SELECT id FROM WorkShiftEmployees WHERE workShiftId IN (:ids)", { ids }, transaction);
  const wseIds = wse.map((r) => Number(r.id));
  if (wseIds.length) await u.del(qi, "CashRegisters", { workShiftEmployeeId: wseIds }, transaction);
  await u.del(qi, "WorkShiftEmployees", { workShiftId: ids }, transaction);
  await u.del(qi, "WorkShifts", { id: ids }, transaction);
});

const seedBookings = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-BOOKING-", transaction);
  await u.deleteBookings(qi, transaction);
  const base = await getBase(qi, Sequelize, transaction);
  const users = (await u.getDemoUsers(qi, Sequelize, transaction)).filter((row) => row.roleName === "USER");
  const courtsByBranch = base.courts.reduce((acc, court) => {
    acc[court.branchId] = acc[court.branchId] || [];
    acc[court.branchId].push(court);
    return acc;
  }, {});
  const occupied = new Set();
  const bookings = [];
  const detailsMeta = [];
  for (let i = 1; i <= 760; i += 1) {
    let branch = u.pick(base.branches);
    let courts = courtsByBranch[branch.id] || base.courts;
    let d = u.randomDate();
    let start = u.bookingHour();
    let duration = u.rand() < 0.72 ? 1 : 2;
    let court = u.pick(courts);
    let key = `${court.id}-${u.dateOnly(d)}-${start}`;
    let guard = 0;
    while (occupied.has(key) && guard < 40) {
      branch = u.pick(base.branches);
      courts = courtsByBranch[branch.id] || base.courts;
      d = u.randomDate();
      start = u.bookingHour();
      court = u.pick(courts);
      key = `${court.id}-${u.dateOnly(d)}-${start}`;
      guard += 1;
    }
    occupied.add(key);
    const status = d > new Date("2026-06-07T00:00:00+07:00")
      ? u.weighted([["CONFIRMED", 55], ["PENDING", 20], ["COMPLETED", 25]])
      : u.weighted([["COMPLETED", 80], ["CANCELLED", 9], ["FAILED", 2], ["CONFIRMED", 9]]);
    const price = priceFor(base.prices, branch.id, d, start, start + duration);
    const createdAt = u.addDays(u.dateTime(d, Math.max(6, start - u.int(12, 72)), u.int(0, 59)), -u.int(1, 14));
    bookings.push({
      bookingStatus: status,
      previousBookingStatus: null,
      totalAmount: status === "CANCELLED" ? 0 : price,
      branchId: branch.id,
      userId: u.pick(users).id,
      discountId: null,
      note: `${u.MARKER} DEMO-BOOKING-${u.pad(i, 5)}`,
      cancelledBy: status === "CANCELLED" ? "USER" : null,
      cancelReason: status === "CANCELLED" ? "Khach hang doi lich demo" : null,
      cancelRejectReason: null,
      cancelRequestedAt: status === "CANCELLED" ? u.addMinutes(createdAt, 20) : null,
      cancelHandledAt: status === "CANCELLED" ? u.addMinutes(createdAt, 50) : null,
      cancelledAt: status === "CANCELLED" ? u.addMinutes(createdAt, 50) : null,
      createdAt,
      updatedAt: u.addMinutes(createdAt, 60),
    });
    detailsMeta.push({ marker: `DEMO-BOOKING-${u.pad(i, 5)}`, courtId: court.id, playDate: u.dateOnly(d), startTime: u.time(start), endTime: u.time(start + duration), price });
  }
  await u.insert(qi, "Bookings", bookings, transaction);
  const dbBookings = await u.q(qi, Sequelize, "SELECT id, note, totalAmount, bookingStatus, createdAt FROM Bookings WHERE note LIKE :note", { note: `%${u.MARKER} DEMO-BOOKING-%` }, transaction);
  const byMarker = new Map(dbBookings.map((b) => [String(b.note).match(/DEMO-BOOKING-\d+/)?.[0], b]));
  await u.insert(qi, "BookingDetails", detailsMeta.map((d) => ({ bookingId: byMarker.get(d.marker)?.id, monthlyBookingId: null, courtId: d.courtId, playDate: d.playDate, startTime: d.startTime, endTime: d.endTime, price: d.price })).filter((d) => d.bookingId), transaction);
  await u.insert(qi, "Payments", dbBookings.map((b, i) => ({
    paymentAmount: b.totalAmount,
    paymentMethod: u.weighted([["VNPAY", 40], ["WALLET", 35], ["CASH", 25]]),
    paymentStatus: b.bookingStatus === "FAILED" ? "FAILED" : b.bookingStatus === "PENDING" ? "PENDING" : "PAID",
    transId: `DEMO-PAY-BOOKING-${u.pad(i + 1, 5)}`,
    externalId: `DEMO-EXT-BOOKING-${u.pad(i + 1, 5)}`,
    paidAt: ["COMPLETED", "CONFIRMED"].includes(b.bookingStatus) ? u.addMinutes(new Date(b.createdAt), 15) : null,
    refundAmount: b.bookingStatus === "CANCELLED" ? b.totalAmount : null,
    refundAt: b.bookingStatus === "CANCELLED" ? u.addMinutes(new Date(b.createdAt), 80) : null,
    targetPaymentType: "BOOKING",
    targetPaymentId: b.id,
  })), transaction);

  const monthly = [];
  for (let i = 1; i <= 22; i += 1) {
    const branch = u.pick(base.branches);
    const court = u.pick(courtsByBranch[branch.id] || base.courts);
    const startDate = u.addDays(u.START, u.int(0, 35));
    const endDate = u.addDays(startDate, 28);
    monthly.push({ userId: u.pick(users).id, branchId: branch.id, courtId: court.id, startDate: u.dateOnly(startDate), endDate: u.dateOnly(endDate), daysOfWeek: "Monday,Wednesday,Friday", startTime: "18:00", endTime: "20:00", totalAmount: 2400000, status: "COMPLETED", note: `${u.MARKER} DEMO-MONTHLY-${u.pad(i, 3)}`, createdAt: u.addDays(startDate, -7), updatedAt: endDate });
  }
  await u.insert(qi, "MonthlyBookings", monthly, transaction);
});

const downBookings = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-BOOKING-", transaction);
  await u.deleteBookings(qi, transaction);
});

const seedCounter = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-COUNTER-", transaction);
  await u.deleteCounter(qi, transaction);
  const base = await getBase(qi, Sequelize, transaction);
  const shifts = await u.q(qi, Sequelize, `
    SELECT wse.id AS sessionId, wse.employeeId, ws.branchId, ws.workDate, ws.startTime, ws.endTime
    FROM WorkShiftEmployees wse
    JOIN WorkShifts ws ON ws.id = wse.workShiftId
    WHERE ws.shiftName LIKE :name AND ws.shiftStatus = 'COMPLETED' AND wse.roleInShift = 'CASHIER'
    ORDER BY ws.workDate
  `, { name: `%${u.MARKER}%` }, transaction);
  const courtsByBranch = base.courts.reduce((acc, court) => ((acc[court.branchId] = acc[court.branchId] || []).push(court), acc), {});
  const drafts = [];
  const itemMeta = [];
  for (let i = 1; i <= 320; i += 1) {
    const session = u.pick(shifts);
    const createdAt = u.dateTime(session.workDate, Number(String(session.startTime).slice(0, 2)) + u.int(0, 6), u.int(0, 55));
    const kind = u.weighted([["court", 35], ["court_bev", 30], ["bev", 15], ["product", 10], ["mixed", 10]]);
    drafts.push({ employeeId: session.employeeId, branchId: session.branchId, nameCustomer: `${u.pick(u.names)} Counter`, phoneNumber: `0966${u.pad(i, 6)}`, note: `${u.MARKER} DEMO-COUNTER-${u.pad(i, 4)} ${kind}`, draftBookingStatus: "COMPLETED", totalAmount: 0, createdAt, updatedAt: u.addMinutes(createdAt, 30) });
    itemMeta.push({ marker: `DEMO-COUNTER-${u.pad(i, 4)}`, session, kind });
  }
  await u.insert(qi, "DraftBookings", drafts, transaction);
  const dbDrafts = await u.q(qi, Sequelize, "SELECT * FROM DraftBookings WHERE note LIKE :note", { note: `%${u.MARKER} DEMO-COUNTER-%` }, transaction);
  const byMarker = new Map(dbDrafts.map((d) => [String(d.note).match(/DEMO-COUNTER-\d+/)?.[0], d]));
  const courtItems = [], productItems = [], bevItems = [], offlines = [], payments = [];
  itemMeta.forEach((m, i) => {
    const draft = byMarker.get(m.marker);
    if (!draft) return;
    let total = 0;
    if (["court", "court_bev", "mixed"].includes(m.kind)) {
      const court = u.pick(courtsByBranch[m.session.branchId] || base.courts);
      const hour = u.bookingHour();
      const price = priceFor(base.prices, m.session.branchId, m.session.workDate, hour, hour + 1);
      courtItems.push({ draftId: draft.id, courtId: court.id, playDate: m.session.workDate, startTime: u.time(hour), endTime: u.time(hour + 1), price, createdAt: draft.createdAt, updatedAt: draft.updatedAt });
      total += price;
    }
    if (["product", "mixed"].includes(m.kind)) {
      const variantPool = base.variants.filter((x) => Number(x.branchId) === Number(m.session.branchId));
      const v = u.pick(variantPool.length ? variantPool : base.variants);
      const quantity = u.int(1, 3);
      const subTotal = u.money(Number(v.price) * quantity);
      productItems.push({ draftId: draft.id, productVariantId: v.id, quantity, subTotal, createdAt: draft.createdAt, updatedAt: draft.updatedAt });
      total += subTotal;
    }
    if (["bev", "court_bev", "mixed"].includes(m.kind)) {
      const beveragePool = base.beverages.filter((x) => Number(x.branchId) === Number(m.session.branchId));
      const b = u.pick(beveragePool.length ? beveragePool : base.beverages);
      const quantity = u.int(1, 4);
      const subTotal = u.money(Number(b.price) * quantity);
      bevItems.push({ draftId: draft.id, beverageId: b.id, quantity, subTotal, createdAt: draft.createdAt, updatedAt: draft.updatedAt });
      total += subTotal;
    }
    draft.total = total;
    offlines.push({ draftId: draft.id, paymentMethod: u.weighted([["CASH", 55], ["VNPAY", 30], ["BANK", 15]]), paymentStatus: "PAID", totalAmount: total, paidAt: u.addMinutes(new Date(draft.createdAt), 25), createdAt: draft.createdAt, updatedAt: draft.updatedAt });
  });
  await u.insert(qi, "DraftBookingItems", courtItems, transaction);
  await u.insert(qi, "DraftProductItems", productItems, transaction);
  await u.insert(qi, "DraftBeverageItems", bevItems, transaction);
  for (const d of dbDrafts) {
    const meta = itemMeta.find((m) => byMarker.get(m.marker)?.id === d.id);
    const sum = [...courtItems, ...productItems, ...bevItems].filter((x) => x.draftId === d.id).reduce((s, x) => s + Number(x.price || x.subTotal || 0), 0);
    await u.exec(qi, "UPDATE DraftBookings SET totalAmount = :sum WHERE id = :id", { sum, id: d.id }, transaction);
  }
  await u.insert(qi, "OfflineBookings", offlines, transaction);
  const dbOffline = await u.q(qi, Sequelize, `
    SELECT ob.*, db.createdAt AS draftCreatedAt FROM OfflineBookings ob
    JOIN DraftBookings db ON db.id = ob.draftId
    WHERE db.note LIKE :note
  `, { note: `%${u.MARKER}%` }, transaction);
  await u.insert(qi, "Payments", dbOffline.map((o, i) => ({ paymentAmount: o.totalAmount, paymentMethod: o.paymentMethod, paymentStatus: "PAID", transId: `DEMO-PAY-COUNTER-${u.pad(i + 1, 5)}`, externalId: `DEMO-EXT-COUNTER-${u.pad(i + 1, 5)}`, paidAt: o.paidAt, refundAmount: null, refundAt: null, targetPaymentType: "BOOKING", targetPaymentId: o.id })), transaction);
});

const downCounter = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-COUNTER-", transaction);
  await u.deleteCounter(qi, transaction);
});

const seedOrders = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-ORDER-", transaction);
  await u.deleteOrders(qi, transaction);
  const base = await getBase(qi, Sequelize, transaction);
  const customers = (await u.getDemoUsers(qi, Sequelize, transaction)).filter((row) => row.roleName === "USER");
  const userAddresses = await u.q(qi, Sequelize, "SELECT * FROM UserAddresses WHERE userId IN (:ids)", { ids: customers.map((c) => c.id) }, transaction);
  const addrByUser = userAddresses.reduce((acc, a) => ((acc[a.userId] = acc[a.userId] || []).push(a), acc), {});
  const groups = [];
  const groupMeta = [];
  for (let i = 1; i <= 560; i += 1) {
    const user = u.pick(customers);
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    const status = createdAt > new Date("2026-06-07T00:00:00+07:00")
      ? u.weighted([["PAID", 65], ["PENDING_PAYMENT", 20], ["FAILED", 5], ["CANCELLED", 10]])
      : u.weighted([["PAID", 86], ["FAILED", 3], ["CANCELLED", 11]]);
    groups.push({ totalAmount: 0, totalShippingFee: 0, discountId: null, discountAmount: 0, isDiscountApplied: false, finalAmount: 0, status, note: `${u.MARKER} DEMO-ORDER-GROUP-${u.pad(i, 5)}`, userId: user.id, createdAt, updatedAt: u.addMinutes(createdAt, 30) });
    groupMeta.push({ marker: `DEMO-ORDER-GROUP-${u.pad(i, 5)}`, user, createdAt, status });
  }
  await u.insert(qi, "OrderGroups", groups, transaction);
  const dbGroups = await u.q(qi, Sequelize, "SELECT * FROM OrderGroups WHERE note LIKE :note", { note: `%${u.MARKER} DEMO-ORDER-GROUP-%` }, transaction);
  const groupByMarker = new Map(dbGroups.map((g) => [String(g.note).match(/DEMO-ORDER-GROUP-\d+/)?.[0], g]));
  const orders = [];
  const orderMeta = [];
  groupMeta.forEach((meta, i) => {
    const group = groupByMarker.get(meta.marker);
    if (!group) return;
    const orderCount = i % 3 === 0 ? 2 : 1;
    const usedBranches = new Set();
    for (let j = 0; j < orderCount; j += 1) {
      let branch = u.pick(base.branches);
      if (usedBranches.has(branch.id)) branch = base.branches[(j + i) % base.branches.length];
      usedBranches.add(branch.id);
      const orderStatus = meta.status === "CANCELLED" ? "CANCELLED" : meta.status === "FAILED" ? "FAILED" : (meta.createdAt > new Date("2026-06-07T00:00:00+07:00") ? u.weighted([["READY_TO_SHIP", 30], ["SHIPPING", 35], ["COMPLETED", 35]]) : u.weighted([["COMPLETED", 78], ["CANCELLED", 9], ["RETURNED", 4], ["FAILED", 2], ["SHIPPING", 7]]));
      const shippingStatus = orderStatus === "COMPLETED" ? "DELIVERED" : orderStatus === "RETURNED" ? "RETURNED" : orderStatus === "CANCELLED" ? "CANCELLED" : orderStatus === "FAILED" ? "FAILED" : orderStatus === "SHIPPING" ? u.pick(["PICKING", "PICKED", "IN_TRANSIT", "DELIVERING"]) : "CREATED";
      const addr = (addrByUser[meta.user.id] || [u.addresses[i % u.addresses.length]])[0];
      const marker = `DEMO-ORDER-${u.pad(i + 1, 5)}-${j + 1}`;
      orders.push({ orderStatus, previousOrderStatus: null, subtotal: 0, shippingFee: 30000, totalAmount: 30000, shippingName: meta.user.fullName || u.pick(u.names), shippingPhone: meta.user.phoneNumber || `0977${u.pad(i, 6)}`, shippingAddress: addr.address, shippingDistrictId: addr.districtId, shippingWardCode: addr.wardCode, shippingWeight: 1.2, shippingServiceId: 53320, shippingFeeReal: 30000, shippingStatus, deliveredAt: shippingStatus === "DELIVERED" ? u.addDays(meta.createdAt, 3) : null, trackingCode: `BH-DEMO-${u.pad(i + 1, 5)}-${j + 1}`, shippingOrderCode: `BH-DEMO-GHN-${u.pad(i + 1, 5)}-${j + 1}`, estimatedDelivery: u.addDays(meta.createdAt, 4), branchId: branch.id, orderGroupId: group.id, cancelledBy: orderStatus === "CANCELLED" ? "USER" : null, cancelReason: orderStatus === "CANCELLED" ? "Khach huy don demo" : null, cancelRequestedAt: orderStatus === "CANCELLED" ? u.addMinutes(meta.createdAt, 20) : null, cancelHandledAt: orderStatus === "CANCELLED" ? u.addMinutes(meta.createdAt, 80) : null, cancelRejectReason: null, returnReason: orderStatus === "RETURNED" ? "Khach tra hang demo" : null, returnRequestedAt: orderStatus === "RETURNED" ? u.addDays(meta.createdAt, 5) : null, returnHandledAt: orderStatus === "RETURNED" ? u.addDays(meta.createdAt, 6) : null, cancelledAt: orderStatus === "CANCELLED" ? u.addMinutes(meta.createdAt, 80) : null, returnedAt: orderStatus === "RETURNED" ? u.addDays(meta.createdAt, 6) : null, createdAt: meta.createdAt, updatedAt: u.addDays(meta.createdAt, 1) });
      orderMeta.push({ marker, branchId: branch.id, groupId: group.id });
    }
  });
  await u.insert(qi, "Orders", orders, transaction);
  const dbOrders = await u.q(qi, Sequelize, "SELECT * FROM Orders WHERE trackingCode LIKE 'BH-DEMO-%'", {}, transaction);
  const details = [];
  for (const order of dbOrders) {
    const pool = base.variants.filter((v) => Number(v.branchId) === Number(order.branchId));
    const selected = [];
    const lineCount = u.int(1, 3);
    for (let i = 0; i < lineCount && pool.length; i += 1) {
      const v = pool[(i + Number(order.id)) % pool.length];
      if (selected.includes(v.id)) continue;
      selected.push(v.id);
      const quantity = u.int(1, 3);
      const unitPrice = u.money(Number(v.price) * (1 - Number(v.discount || 0) / 100));
      details.push({ quantity, unitPrice, subTotal: quantity * unitPrice, productName: v.productName, variantInfo: [v.sku, v.color, v.size].filter(Boolean).join(" / "), orderId: order.id, variantId: v.id });
    }
  }
  await u.insert(qi, "OrderDetails", details, transaction);
  const sums = await u.q(qi, Sequelize, "SELECT orderId, SUM(subTotal) AS subtotal FROM OrderDetails WHERE orderId IN (:ids) GROUP BY orderId", { ids: dbOrders.map((o) => o.id) }, transaction);
  for (const s of sums) {
    await u.exec(qi, "UPDATE Orders SET subtotal = :subtotal, totalAmount = :total WHERE id = :id", { subtotal: s.subtotal, total: Number(s.subtotal) + 30000, id: s.orderId }, transaction);
  }
  const groupSums = await u.q(qi, Sequelize, "SELECT orderGroupId, SUM(subtotal) AS amount, SUM(shippingFee) AS shipping FROM Orders WHERE orderGroupId IN (:ids) GROUP BY orderGroupId", { ids: dbGroups.map((g) => g.id) }, transaction);
  for (const s of groupSums) {
    await u.exec(qi, "UPDATE OrderGroups SET totalAmount = :amount, totalShippingFee = :shipping, finalAmount = :final WHERE id = :id", { amount: s.amount, shipping: s.shipping, final: Number(s.amount) + Number(s.shipping), id: s.orderGroupId }, transaction);
  }
  const payGroups = await u.q(qi, Sequelize, "SELECT * FROM OrderGroups WHERE note LIKE :note", { note: `%${u.MARKER} DEMO-ORDER-GROUP-%` }, transaction);
  await u.insert(qi, "Payments", payGroups.map((g, i) => ({ paymentAmount: Number(g.finalAmount || 0), paymentMethod: u.weighted([["COD", 38], ["VNPAY", 34], ["WALLET", 28]]), paymentStatus: g.status === "FAILED" ? "FAILED" : g.status === "PENDING_PAYMENT" ? "PENDING" : g.status === "CANCELLED" ? "REFUNDED" : "PAID", transId: `DEMO-PAY-ORDER-${u.pad(i + 1, 5)}`, externalId: `DEMO-EXT-ORDER-${u.pad(i + 1, 5)}`, paidAt: g.status === "PAID" ? u.addMinutes(new Date(g.createdAt), 20) : null, refundAmount: g.status === "CANCELLED" ? Number(g.finalAmount || 0) : null, refundAt: g.status === "CANCELLED" ? u.addMinutes(new Date(g.createdAt), 90) : null, targetPaymentType: "ORDER", targetPaymentId: g.id })), transaction);
  const logs = [];
  dbOrders.forEach((order) => {
    const chain = order.shippingStatus === "DELIVERED" ? ["CREATED", "PICKING", "PICKED", "IN_TRANSIT", "DELIVERING", "DELIVERED"] : order.shippingStatus === "RETURNED" ? ["CREATED", "PICKING", "PICKED", "IN_TRANSIT", "RETURNING", "RETURNED"] : order.shippingStatus === "CANCELLED" ? ["CREATED", "CANCELLED"] : ["CREATED", order.shippingStatus];
    chain.filter(Boolean).forEach((status, index) => logs.push({ orderId: order.id, status, description: `${u.MARKER} Shipping ${status}`, eventTime: u.addMinutes(new Date(order.createdAt), 60 * (index + 1)), rawData: JSON.stringify({ demo: true, status }), createdAt: u.addMinutes(new Date(order.createdAt), 60 * (index + 1)) }));
  });
  await u.insert(qi, "OrderShippingLogs", logs, transaction);
});

const downOrders = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await paymentPrefix(qi, "DEMO-EXT-ORDER-", transaction);
  await u.deleteOrders(qi, transaction);
});

const seedFeedbacks = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await u.del(qi, "Feedbacks", { content: { [Sequelize.Op.like]: `%${u.MARKER}%` } }, transaction);
  const orderRows = await u.q(qi, Sequelize, `
    SELECT o.id AS orderId, og.userId, od.variantId, o.createdAt
    FROM Orders o JOIN OrderGroups og ON og.id = o.orderGroupId
    JOIN OrderDetails od ON od.orderId = o.id
    WHERE o.trackingCode LIKE 'BH-DEMO-%' AND o.orderStatus = 'COMPLETED'
    LIMIT 220
  `, {}, transaction);
  const branchRows = await u.q(qi, Sequelize, `
    SELECT MIN(b.id) AS bookingId, b.userId, b.branchId, MAX(b.createdAt) AS createdAt
    FROM Bookings b
    WHERE b.note LIKE :note AND b.bookingStatus = 'COMPLETED'
    GROUP BY b.userId, b.branchId
    LIMIT 90
  `, { note: `%${u.MARKER}%` }, transaction);
  const comments = ["San sach, nhan vien ho tro tot", "Hang dung mo ta, giao nhanh", "Trai nghiem on va se quay lai", "Gia hop ly cho du lieu demo", "Can cai thien thoi gian cho mot chut"];
  const feedbacks = [];
  orderRows.forEach((row, i) => feedbacks.push({ userId: row.userId, orderId: row.orderId, variantId: row.variantId, branchId: null, content: `${u.MARKER} ${u.pick(comments)} #${u.pad(i)}`, rating: u.weighted([[5, 45], [4, 35], [3, 15], [2, 4], [1, 1]]), createdAt: u.addDays(new Date(row.createdAt), u.int(2, 9)), updatedAt: u.addDays(new Date(row.createdAt), u.int(2, 9)) }));
  branchRows.forEach((row, i) => feedbacks.push({ userId: row.userId, orderId: null, variantId: null, branchId: row.branchId, content: `${u.MARKER} ${u.pick(comments)} branch #${u.pad(i)}`, rating: u.weighted([[5, 45], [4, 35], [3, 15], [2, 4], [1, 1]]), createdAt: u.addDays(new Date(row.createdAt), u.int(1, 8)), updatedAt: u.addDays(new Date(row.createdAt), u.int(1, 8)) }));
  await u.insert(qi, "Feedbacks", feedbacks.slice(0, 300), transaction);
});

const downFeedbacks = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await u.del(qi, "Feedbacks", { content: { [Sequelize.Op.like]: `%${u.MARKER}%` } }, transaction);
});

const seedCoachClasses = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await u.deleteChat(qi, transaction);
  await u.deleteSocial(qi, transaction);
  const users = await u.getDemoUsers(qi, Sequelize, transaction);
  const coaches = users.filter((row) => row.roleName === "COACH");
  const customers = users.filter((row) => row.roleName === "USER");
  const posts = [];
  for (let i = 1; i <= 22; i += 1) {
    const coach = u.pick(coaches);
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    posts.push({ authorId: coach.id, type: "CLASS", title: `${u.MARKER} Lop cau long demo ${u.pad(i, 3)}`, content: `${u.MARKER} Lop huong dan ky thuat co ban, danh doi va phan xa cho hoc vien demo.`, formData: JSON.stringify({ capacity: 12 + (i % 8), startDate: u.dateOnly(u.addDays(createdAt, 7)), fee: 2000000 + (i % 4) * 300000 }), repostOfPostId: null, isRepost: false, isActive: true, isDeleted: false, deletedAt: null, createdAt, updatedAt: createdAt });
  }
  await u.insert(qi, "Posts", posts, transaction);
  const dbPosts = await u.q(qi, Sequelize, "SELECT * FROM Posts WHERE title LIKE :note AND type = 'CLASS'", { note: `%${u.MARKER}%` }, transaction);
  const conversations = dbPosts.map((p, i) => ({ conversationName: `${u.MARKER} Lop demo ${u.pad(i + 1, 3)}`, avatar: u.avatar, type: "GROUP", createdAt: p.createdAt, updatedAt: p.createdAt }));
  await u.insert(qi, "Conversations", conversations, transaction);
  const dbConvs = await u.q(qi, Sequelize, "SELECT * FROM Conversations WHERE conversationName LIKE :name ORDER BY id", { name: `%${u.MARKER} Lop demo%` }, transaction);
  await u.insert(qi, "ClassRooms", dbPosts.map((p, i) => ({ postId: p.id, coachUserId: p.authorId, conversationId: dbConvs[i]?.id || null, enrollmentStatus: i % 5 === 0 ? "ENDED" : i % 7 === 0 ? "LOCKED" : "OPEN", createdAt: p.createdAt, updatedAt: p.updatedAt })), transaction);
  const enrollments = [];
  const participants = [];
  dbPosts.forEach((p, i) => {
    const conv = dbConvs[i];
    if (conv) participants.push({ conversationId: conv.id, userId: p.authorId, role: "ADMIN", joinedAt: p.createdAt, lastReadAt: p.createdAt });
    const count = 5 + (i % 8);
    for (let j = 0; j < count; j += 1) {
      const student = customers[(i * 11 + j) % customers.length];
      const createdAt = u.addDays(new Date(p.createdAt), u.int(1, 5));
      enrollments.push({ postId: p.id, coachUserId: p.authorId, studentUserId: student.id, status: i % 5 === 0 ? "COMPLETED" : u.weighted([["ACTIVE", 76], ["PENDING", 12], ["REJECTED", 6], ["CANCELLED", 6]]), source: "POST_REGISTER", coachNote: `${u.MARKER} Enrollment demo`, rejectReason: null, createdAt, updatedAt: createdAt });
      if (conv) participants.push({ conversationId: conv.id, userId: student.id, role: "MEMBER", joinedAt: createdAt, lastReadAt: createdAt });
    }
  });
  await u.insert(qi, "ClassEnrollments", enrollments.slice(0, 180), transaction);
  const seen = new Set();
  await u.insert(qi, "ConversationParticipants", participants.filter((p) => {
    const key = `${p.conversationId}-${p.userId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }), transaction);
});

const downCoachClasses = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await u.deleteChat(qi, transaction);
  await u.deleteSocial(qi, transaction);
});

const seedSocial = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const users = await u.getDemoUsers(qi, Sequelize, transaction);
  const authors = users.filter((row) => ["USER", "COACH"].includes(row.roleName));
  const posts = [];
  for (let i = 1; i <= 220; i += 1) {
    const author = u.pick(authors);
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    const type = author.roleName === "COACH" ? u.weighted([["GROUP", 45], ["FIND_COACH", 35], ["CLASS", 20]]) : u.weighted([["FIND_PLAYER", 45], ["GROUP", 35], ["TOURNAMENT", 10], ["FIND_COACH", 10]]);
    posts.push({ authorId: author.id, type, title: `${u.MARKER} Bai viet cong dong ${u.pad(i, 4)}`, content: `${u.MARKER} Chia se kinh nghiem cau long, tim ban danh cau va danh gia san demo ${u.pad(i, 4)}.`, formData: JSON.stringify({ imageUrl: `https://placehold.co/900x600/png?text=B-Hub+Post+${u.pad(i, 4)}` }), repostOfPostId: null, isRepost: false, isActive: true, isDeleted: false, deletedAt: null, createdAt, updatedAt: createdAt });
  }
  await u.insert(qi, "Posts", posts, transaction);
  const dbPosts = await u.q(qi, Sequelize, "SELECT * FROM Posts WHERE title LIKE :note AND title LIKE '%Bai viet%'", { note: `%${u.MARKER}%` }, transaction);
  const likes = [], shares = [], comments = [];
  dbPosts.forEach((post, i) => {
    const likeCount = i % 17 === 0 ? 35 : i % 5 === 0 ? 14 : u.int(2, 9);
    for (let j = 0; j < likeCount; j += 1) {
      const user = users[(i * 13 + j) % users.length];
      if (user.id === post.authorId) continue;
      const createdAt = u.addMinutes(new Date(post.createdAt), 10 + j);
      likes.push({ userId: user.id, postId: post.id, reactionType: u.weighted([["LIKE", 70], ["LOVE", 15], ["HAHA", 6], ["WOW", 5], ["SAD", 2], ["ANGRY", 2]]), createdAt, updatedAt: createdAt });
    }
    if (i % 2 === 0) shares.push({ userId: users[(i * 7) % users.length].id, postId: post.id, type: "SHARE", content: `${u.MARKER} Chia se bai viet hay`, createdAt: u.addMinutes(new Date(post.createdAt), 120), updatedAt: u.addMinutes(new Date(post.createdAt), 120) });
    const commentCount = i % 11 === 0 ? 18 : u.int(2, 7);
    for (let j = 0; j < commentCount; j += 1) {
      comments.push({ parentId: null, authorId: users[(i * 9 + j) % users.length].id, postId: post.id, content: `${u.MARKER} Binh luan demo rat huu ich ${u.pad(j, 2)}`, type: "COMMENT", isDeleted: false, deletedAt: null, createdAt: u.addMinutes(new Date(post.createdAt), 30 + j * 4), updatedAt: u.addMinutes(new Date(post.createdAt), 30 + j * 4) });
    }
  });
  const likeSeen = new Set();
  await u.insert(qi, "PostLikes", likes.filter((l) => { const key = `${l.userId}-${l.postId}`; if (likeSeen.has(key)) return false; likeSeen.add(key); return true; }).slice(0, 2400), transaction);
  await u.insert(qi, "PostShares", shares.slice(0, 300), transaction);
  await u.insert(qi, "Comments", comments.slice(0, 1100), transaction);
});

const downSocial = async (qi) => u.phaseTransaction(qi, async (transaction) => {
  await u.deleteSocial(qi, transaction);
});

const seedChatNotificationsAi = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await u.deleteChat(qi, transaction);
  await u.del(qi, "Notifications", { message: { [Sequelize.Op.like]: `%${u.MARKER}%` } }, transaction);
  const oldSessions = await u.q(qi, Sequelize, "SELECT id FROM AiChatSessions WHERE title LIKE :title", { title: `%${u.MARKER}%` }, transaction).catch(() => []);
  const oldSessionIds = oldSessions.map((row) => Number(row.id));
  if (oldSessionIds.length) await u.del(qi, "AiChatMessages", { sessionId: oldSessionIds }, transaction).catch(() => {});
  if (oldSessionIds.length) await u.del(qi, "AiChatSessions", { id: oldSessionIds }, transaction).catch(() => {});
  const users = await u.getDemoUsers(qi, Sequelize, transaction);
  const customers = users.filter((row) => row.roleName === "USER");
  const staff = users.filter((row) => ["COACH", "EMPLOYEE"].includes(row.roleName));
  const convs = [];
  for (let i = 1; i <= 120; i += 1) {
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    convs.push({ conversationName: `${u.MARKER} Chat demo ${u.pad(i, 4)}`, avatar: u.avatar, type: "PRIVATE", createdAt, updatedAt: u.addMinutes(createdAt, 60) });
  }
  await u.insert(qi, "Conversations", convs, transaction);
  const dbConvs = await u.q(qi, Sequelize, "SELECT * FROM Conversations WHERE conversationName LIKE :name", { name: `%${u.MARKER} Chat demo%` }, transaction);
  const participants = [], messages = [];
  dbConvs.forEach((conv, i) => {
    const a = customers[i % customers.length];
    const b = staff[i % staff.length];
    participants.push({ conversationId: conv.id, userId: a.id, role: "MEMBER", joinedAt: conv.createdAt, lastReadAt: conv.updatedAt });
    participants.push({ conversationId: conv.id, userId: b.id, role: "MEMBER", joinedAt: conv.createdAt, lastReadAt: conv.updatedAt });
    const count = 8 + (i % 18);
    for (let j = 0; j < count; j += 1) messages.push({ conversationId: conv.id, senderId: j % 2 === 0 ? a.id : b.id, body: `${u.MARKER} Tin nhan demo ve san, lop hoc hoac san pham ${u.pad(j, 2)}`, mediaUrl: null, isRecalled: false, type: "TEXT", replyToId: null, isRead: i % 4 !== 0, createdAt: u.addMinutes(new Date(conv.createdAt), j * 5), updatedAt: u.addMinutes(new Date(conv.createdAt), j * 5) });
  });
  await u.insert(qi, "ConversationParticipants", participants, transaction);
  await u.insert(qi, "Messages", messages.slice(0, 2200), transaction);
  const notifications = [];
  for (let i = 0; i < 1200; i += 1) {
    const user = users[i % users.length];
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    notifications.push({ title: "Thong bao demo B-Hub", message: `${u.MARKER} Thong bao ve booking, order, chat hoac lop hoc ${u.pad(i, 4)}`, isRead: createdAt < new Date("2026-06-01T00:00:00+07:00") ? i % 4 !== 0 : i % 2 === 0, userId: user.id, role: null, type: u.pick(["BOOKING", "ORDER", "PAYMENT", "MESSAGE", "CLASS"]), createdAt, updatedAt: createdAt });
  }
  await u.insert(qi, "Notifications", notifications, transaction);
  const sessions = [];
  for (let i = 1; i <= 140; i += 1) {
    const user = i % 5 === 0 ? null : customers[i % customers.length];
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    sessions.push({ userId: user?.id || null, guestToken: user ? null : `demo-guest-${u.pad(i, 4)}`, context: u.pick(["general", "booking", "shopping", "coach"]), title: `${u.MARKER} AI chat demo ${u.pad(i, 4)}`, branchId: null, courtId: null, productId: null, createdAt, updatedAt: u.addMinutes(createdAt, 20) });
  }
  await u.insert(qi, "AiChatSessions", sessions, transaction);
  const dbSessions = await u.q(qi, Sequelize, "SELECT * FROM AiChatSessions WHERE title LIKE :title", { title: `%${u.MARKER}%` }, transaction);
  const aiMessages = [];
  dbSessions.forEach((s, i) => {
    const count = 4 + (i % 5) * 2;
    for (let j = 0; j < count; j += 1) aiMessages.push({ sessionId: s.id, role: j % 2 === 0 ? "user" : "assistant", content: j % 2 === 0 ? "Tim san hoac san pham phu hop" : `${u.MARKER} Cau tra loi demo, khong goi API that.`, createdAt: u.addMinutes(new Date(s.createdAt), j * 3) });
  });
  await u.insert(qi, "AiChatMessages", aiMessages.slice(0, 900), transaction);
});

const downChatNotificationsAi = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const oldSessions = await u.q(qi, Sequelize, "SELECT id FROM AiChatSessions WHERE title LIKE :title", { title: `%${u.MARKER}%` }, transaction).catch(() => []);
  const oldSessionIds = oldSessions.map((row) => Number(row.id));
  if (oldSessionIds.length) await u.del(qi, "AiChatMessages", { sessionId: oldSessionIds }, transaction).catch(() => {});
  if (oldSessionIds.length) await u.del(qi, "AiChatSessions", { id: oldSessionIds }, transaction).catch(() => {});
  await u.del(qi, "Notifications", { message: { [Sequelize.Op.like]: `%${u.MARKER}%` } }, transaction);
  await u.deleteChat(qi, transaction);
});

const seedInventory = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const old = await u.q(qi, Sequelize, "SELECT id FROM PurchaseReceipts WHERE receiptCode LIKE 'DEMO-PR-%'", {}, transaction);
  const oldIds = old.map((r) => Number(r.id));
  if (oldIds.length) {
    await u.del(qi, "StockTransactions", { referenceType: "PURCHASE_RECEIPT", referenceId: oldIds }, transaction);
    await u.del(qi, "PurchaseReceiptDetails", { purchaseReceiptId: oldIds }, transaction);
    await u.del(qi, "PurchaseReceipts", { id: oldIds }, transaction);
  }
  const base = await getBase(qi, Sequelize, transaction);
  const suppliers = await u.q(qi, Sequelize, "SELECT * FROM Suppliers ORDER BY id", {}, transaction);
  const creator = base.managers[0]?.id || (await u.getDemoUsers(qi, Sequelize, transaction))[0]?.id;
  const receipts = [];
  for (let i = 1; i <= 55; i += 1) {
    const createdAt = u.dateTime(u.randomDate(), u.int(8, 17), u.int(0, 59));
    const status = u.weighted([["APPROVED", 80], ["REJECTED", 12], ["PENDING", 5], ["CANCELLED", 3]]);
    receipts.push({ receiptCode: `DEMO-PR-${u.pad(i, 5)}`, branchId: u.pick(base.branches).id, supplierId: u.pick(suppliers).id, createdBy: creator, approvedBy: status === "APPROVED" ? creator : null, status, totalAmount: 0, note: `${u.MARKER} Import demo`, approvedAt: status === "APPROVED" ? u.addMinutes(createdAt, 120) : null, createdAt, updatedAt: u.addMinutes(createdAt, 120) });
  }
  await u.insert(qi, "PurchaseReceipts", receipts, transaction);
  const dbReceipts = await u.q(qi, Sequelize, "SELECT * FROM PurchaseReceipts WHERE receiptCode LIKE 'DEMO-PR-%'", {}, transaction);
  const details = [], transactions = [];
  dbReceipts.forEach((r, i) => {
    const count = 3 + (i % 3);
    let total = 0;
    for (let j = 0; j < count; j += 1) {
      const useBeverage = (i + j) % 5 === 0;
      const item = useBeverage ? u.pick(base.beverages) : u.pick(base.variants);
      const quantity = u.int(5, 30);
      const importPrice = u.money(Number(item.price || 100000) * 0.62);
      const totalPrice = importPrice * quantity;
      total += totalPrice;
      details.push({ purchaseReceiptId: r.id, itemType: useBeverage ? "BEVERAGE" : "PRODUCT_VARIANT", variantId: useBeverage ? null : item.id, beverageId: useBeverage ? item.id : null, itemName: item.productName || item.beverageName, quantity, importPrice, totalPrice, createdAt: r.createdAt, updatedAt: r.updatedAt });
      if (r.status === "APPROVED") transactions.push({ branchId: r.branchId, itemType: useBeverage ? "BEVERAGE" : "PRODUCT_VARIANT", variantId: useBeverage ? null : item.id, beverageId: useBeverage ? item.id : null, type: "IMPORT", quantity, beforeStock: Number(item.stock || item.branchStock || 10), afterStock: Number(item.stock || item.branchStock || 10) + quantity, referenceType: "PURCHASE_RECEIPT", referenceId: r.id, note: `${u.MARKER} Stock import demo`, createdBy: creator, createdAt: r.approvedAt || r.createdAt });
    }
    r.total = total;
  });
  await u.insert(qi, "PurchaseReceiptDetails", details, transaction);
  for (const r of dbReceipts) {
    const total = details.filter((d) => Number(d.purchaseReceiptId) === Number(r.id)).reduce((sum, d) => sum + Number(d.totalPrice), 0);
    await u.exec(qi, "UPDATE PurchaseReceipts SET totalAmount = :total WHERE id = :id", { total, id: r.id }, transaction);
  }
  await u.insert(qi, "StockTransactions", transactions.slice(0, 600), transaction);
});

const downInventory = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  const old = await u.q(qi, Sequelize, "SELECT id FROM PurchaseReceipts WHERE receiptCode LIKE 'DEMO-PR-%'", {}, transaction);
  const ids = old.map((r) => Number(r.id));
  if (!ids.length) return;
  await u.del(qi, "StockTransactions", { referenceType: "PURCHASE_RECEIPT", referenceId: ids }, transaction);
  await u.del(qi, "PurchaseReceiptDetails", { purchaseReceiptId: ids }, transaction);
  await u.del(qi, "PurchaseReceipts", { id: ids }, transaction);
});

module.exports = {
  seedUsers, downUsers, seedWalletAddress, downWalletAddress,
  seedWorkShifts, downWorkShifts,
  seedBookings, downBookings, seedCounter, downCounter,
  seedOrders, downOrders, seedFeedbacks, downFeedbacks,
  seedCoachClasses, downCoachClasses, seedSocial, downSocial,
  seedChatNotificationsAi, downChatNotificationsAi,
  seedInventory, downInventory,
  getBase, priceFor, paymentPrefix,
};
