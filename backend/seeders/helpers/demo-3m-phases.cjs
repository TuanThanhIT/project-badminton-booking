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
      users.push({
        username,
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
        roleId: roleIds[group.role],
        createdAt: now,
        updatedAt: now,
      });
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

const getPostSeedUsers = async (qi, Sequelize, transaction) => {
  const demoUsers = await u.getDemoUsers(qi, Sequelize, transaction);
  if (demoUsers.length) return demoUsers;
  return u.q(qi, Sequelize, `
    SELECT u.id, u.username, u.roleId, r.roleName, p.fullName, p.phoneNumber
    FROM Users u
    JOIN Roles r ON r.id = u.roleId
    LEFT JOIN Profiles p ON p.userId = u.id
    WHERE u.isActive = 1
    ORDER BY u.id
  `, {}, transaction);
};

const getPostSeedLocations = async (qi, Sequelize, transaction) => {
  const branches = await u.q(qi, Sequelize, "SELECT id, branchName, districtName, provinceName FROM Branches WHERE isActive = 1 ORDER BY id", {}, transaction);
  const courts = await u.q(qi, Sequelize, `
    SELECT c.id, c.branchId, c.courtName
    FROM Courts c
    JOIN Branches b ON b.id = c.branchId
    WHERE b.isActive = 1 AND c.courtStatus = 'ACTIVE'
    ORDER BY c.branchId, c.id
  `, {}, transaction);
  if (!branches.length || !courts.length) {
    throw new Error("Seed Posts requires active Branches and Courts. Please seed Branch/Court before seeding Posts.");
  }
  return {
    branches,
    courts,
    courtPairs: courts.map((court) => ({ branchId: Number(court.branchId), courtId: Number(court.id) })),
  };
};

const postContact = (i) => {
  const phone = `090${String(1234567 + i).slice(-7)}`;
  return { inApp: true, phone, zalo: phone };
};

const typeText = {
  FIND_PLAYER: "tim nguoi choi",
  FIND_COACH: "tim huan luyen vien",
  CLASS: "lop hoc cau long",
  TOURNAMENT: "giai dau",
  GROUP: "nhom cong dong",
};

const levelText = {
  BEGINNER: "moi choi",
  INTERMEDIATE: "trung binh",
  ADVANCED: "nang cao",
  BASIC: "co ban",
};

const weekdayText = {
  1: "chu nhat",
  2: "thu hai",
  3: "thu ba",
  4: "thu tu",
  5: "thu nam",
  6: "thu sau",
  7: "thu bay",
};

const textValue = (value) => value === null || value === undefined || value === "" ? "khong ro" : value;
const weekdaysText = (weekdays = []) => weekdays.map((day) => weekdayText[day] || day).join(", ");

const buildSeedModerationText = (type, title, content, formData) => {
  const parts = [
    `Loai bai: ${typeText[type] || type}.`,
    title.replace(u.MARKER, "").trim(),
    content.replace(u.MARKER, "").trim(),
  ];

  if (type === "FIND_PLAYER") {
    parts.push(
      `Ngay choi: ${textValue(formData.schedule?.date)}.`,
      `Gio choi: ${textValue(formData.schedule?.startTime)} den ${textValue(formData.schedule?.endTime)}.`,
      `Trinh do yeu cau: ${levelText[formData.playerRequirement?.level] || textValue(formData.playerRequirement?.customLevel || formData.playerRequirement?.level)}.`,
      `So nguoi can tim: ${textValue(formData.playerRequirement?.slotsNeeded)}.`,
      `Ghi chu: ${textValue(formData.notes)}.`,
    );
  } else if (type === "FIND_COACH") {
    parts.push(
      `Trinh do hien tai: ${levelText[formData.currentLevel] || textValue(formData.currentLevel)}.`,
      `Muc tieu: ${textValue(formData.goal)}.`,
      `Lich hoc mong muon: ${textValue(formData.scheduleNote)}.`,
      `Ngan sach: ${textValue(formData.budget)}.`,
      `Ghi chu: ${textValue(formData.notes)}.`,
    );
  } else if (type === "CLASS") {
    parts.push(
      `Trinh do dau vao: ${levelText[formData.inputLevel] || textValue(formData.inputLevel)}.`,
      `Do tuoi: ${textValue(formData.ageRange)}.`,
      `Ngay hoc trong tuan: ${weekdaysText(formData.schedule?.weekdays)}.`,
      `Ngay bat dau: ${textValue(formData.schedule?.startDate)}.`,
      `Gio hoc: ${textValue(formData.schedule?.startTime)} den ${textValue(formData.schedule?.endTime)}.`,
      `So hoc vien toi da: ${textValue(formData.maxStudents)}.`,
      `Hoc phi: ${textValue(formData.tuitionFee)}.`,
      `Ghi chu: ${textValue(formData.notes)}.`,
    );
  } else if (type === "TOURNAMENT") {
    parts.push(
      `Don vi to chuc: ${textValue(formData.organizerName)}.`,
      `Mo dang ky: ${textValue(formData.registration?.startDate)} den ${textValue(formData.registration?.endDate)}.`,
      `Ngay thi dau: ${textValue(formData.eventDate)}.`,
      `Hang muc: ${(formData.categories || []).join(", ")}.`,
    );
  } else if (type === "GROUP") {
    parts.push(
      `Khu vuc: ${textValue(formData.area?.district)}, ${textValue(formData.area?.city)}.`,
      `Lich hang tuan: ${weekdaysText(formData.weeklySchedule?.weekdays)}.`,
      `Gio sinh hoat: ${textValue(formData.weeklySchedule?.startTime)} den ${textValue(formData.weeklySchedule?.endTime)}.`,
      `Trinh do mong muon: ${levelText[formData.levelWanted] || textValue(formData.levelWanted)}.`,
    );
  }

  return parts.filter(Boolean).join(" ");
};

const postModerationFields = (type, title, content, formData, createdAt, i, overrides = {}) => ({
  moderationStatus: overrides.moderationStatus || "APPROVED",
  moderationLabel: overrides.moderationLabel || "normal",
  moderationConfidence: overrides.moderationConfidence ?? Number((0.95 + (i % 5) * 0.01).toFixed(2)),
  moderationAction: overrides.moderationAction || "ALLOW",
  moderationReason: overrides.moderationReason || "Noi dung hop le.",
  moderationText: overrides.moderationText || buildSeedModerationText(type, title, content, formData),
  moderatedAt: overrides.moderatedAt || u.addMinutes(createdAt, 5),
});

const buildPostRow = ({ authorId, type, title, content, formData, createdAt, index, moderation = {}, isActive = true }) => ({
  authorId,
  type,
  title,
  content,
  formData: JSON.stringify(formData),
  ...postModerationFields(type, title, content, formData, createdAt, index, moderation),
  repostOfPostId: null,
  isRepost: false,
  isActive,
  isDeleted: false,
  deletedAt: null,
  createdAt,
  updatedAt: createdAt,
});

const applyDemoModerationAccountStatus = async (qi, Sequelize, transaction) => {
  const demoUsers = await u.q(qi, Sequelize, "SELECT id FROM Users WHERE username LIKE 'demo\\_%'", {}, transaction);
  const demoUserIds = demoUsers.map((row) => Number(row.id));
  if (!demoUserIds.length) return;

  await u.exec(qi, `
    UPDATE Users
    SET accountStatus = 'ACTIVE',
        suspendedUntil = NULL,
        suspensionReason = NULL,
        violationCount = 0,
        lastViolationAt = NULL,
        updatedAt = NOW()
    WHERE id IN (:ids)
  `, { ids: demoUserIds }, transaction);

  const totals = await u.q(qi, Sequelize, `
    SELECT userId, COUNT(*) AS total, MAX(createdAt) AS lastViolationAt
    FROM UserModerationViolations
    WHERE userId IN (:ids)
    GROUP BY userId
  `, { ids: demoUserIds }, transaction).catch(() => []);

  for (const row of totals) {
    const total = Number(row.total || 0);
    const status = total >= 5 ? "BANNED" : total >= 3 ? "SUSPENDED" : total >= 2 ? "WARNING" : "ACTIVE";
    const suspendedUntil = status === "SUSPENDED" ? u.addDays(new Date(), 1) : null;
    const suspensionReason = status === "BANNED"
      ? "Tai khoan bi khoa do vi pham nghiem trong quy dinh cong dong."
      : status === "SUSPENDED"
        ? "Tai khoan co nhieu bai viet vi pham quy dinh cong dong."
        : null;

    await u.exec(qi, `
      UPDATE Users
      SET accountStatus = :status,
          suspendedUntil = :suspendedUntil,
          suspensionReason = :suspensionReason,
          violationCount = :total,
          lastViolationAt = :lastViolationAt,
          updatedAt = NOW()
      WHERE id = :userId
    `, {
      status,
      suspendedUntil,
      suspensionReason,
      total,
      lastViolationAt: row.lastViolationAt,
      userId: row.userId,
    }, transaction);
  }
};

const classPlans = [
  { title: "Lớp cầu lông căn bản cho người mới", content: "Nhận học viên mới bắt đầu, tập cầm vợt, di chuyển cơ bản và phát cầu đúng kỹ thuật.", level: "BEGINNER", ageRange: "15-25 tuổi", weekdays: [2, 4, 6], start: "19:00", end: "21:00", fee: "2 triệu đồng/khóa", notes: "Học viên tự chuẩn bị vợt." },
  { title: "Lớp đánh đôi buổi tối", content: "Tập chiến thuật đánh đôi, xoay cầu và phối hợp trên sân cho học viên đã biết đánh cơ bản.", level: "INTERMEDIATE", ageRange: "18-35 tuổi", weekdays: [3, 5, 7], start: "18:30", end: "20:30", fee: "2.4 triệu đồng/khóa", notes: "Nên có giày cầu lông riêng." },
  { title: "Lớp kỹ thuật trái tay cuối tuần", content: "Sửa động tác trái tay, phòng thủ cuối sân và chuyển trạng thái sang tấn công.", level: "INTERMEDIATE", ageRange: "16-40 tuổi", weekdays: [7, 1], start: "08:00", end: "10:00", fee: "1.8 triệu đồng/khóa", notes: "Có bài tập thêm sau mỗi buổi." },
  { title: "Lớp cầu lông thiếu nhi", content: "Lớp nhỏ cho học viên thiếu nhi, ưu tiên thể lực, phản xạ và kỹ thuật an toàn.", level: "BEGINNER", ageRange: "8-14 tuổi", weekdays: [6, 7], start: "17:30", end: "19:00", fee: "1.6 triệu đồng/khóa", notes: "Phụ huynh có thể trao đổi qua chat trong app." },
  { title: "Lớp nâng cao phong trào", content: "Rèn tốc độ, điều cầu và bài tập thi đấu cho người chơi phong trào muốn lên trình.", level: "ADVANCED", ageRange: "18-45 tuổi", weekdays: [2, 5], start: "20:00", end: "22:00", fee: "2.8 triệu đồng/khóa", notes: "Ưu tiên học viên đã chơi trên 1 năm." },
];

const findPlayerTemplates = [
  { title: "Tìm 2 bạn ghép sân đánh đôi tối nay", content: "Nhóm mình thiếu 2 slot đánh đôi, tiền sân chia đều, ưu tiên đến đúng giờ để khỏi trễ lịch.", level: "INTERMEDIATE", slots: 2, notes: "Có mặt trước 15 phút để khởi động." },
  { title: "Cần người chơi cùng sau giờ làm", content: "Đã đặt sân buổi tối, cần thêm bạn đánh cùng trình độ trung bình, vui vẻ và chơi lâu dài.", level: "INTERMEDIATE", slots: 1, notes: "Tiền cầu và tiền sân chia đều." },
  { title: "Ghép sân đánh đơn/đánh đôi cuối tuần", content: "Tìm bạn đánh ổn định cuối tuần, có thể xoay cặp đánh đôi nếu đủ người.", level: "BEGINNER", slots: 2, notes: "Không yêu cầu quá nặng, chỉ cần đúng giờ." },
  { title: "Thiếu slot đánh đôi phong trào", content: "Sân đã có 2 người, cần thêm 2 bạn đánh phong trào, ưu tiên người chơi đều và lịch sự.", level: "ADVANCED", slots: 2, notes: "Mang theo cầu riêng nếu có." },
];

const findCoachTemplates = [
  { title: "Tìm huấn luyện viên sửa kỹ thuật cơ bản", content: "Mình mới chơi cầu lông, cần HLV sửa cầm vợt, di chuyển và phản xạ trong các buổi tối.", level: "BEGINNER", goal: "Cải thiện kỹ thuật và phản xạ", schedule: "Tối thứ 7 và chủ nhật", budget: "500.000 đồng/tháng", notes: "Ưu tiên huấn luyện viên có kinh nghiệm dạy người mới." },
  { title: "Cần HLV dạy đánh đôi", content: "Muốn học cách di chuyển, bổ vị trí và phối hợp khi đánh đôi, lịch học có thể trao đổi thêm.", level: "INTERMEDIATE", goal: "Học chiến thuật đánh đôi và điều cầu", schedule: "Tối thứ 3 và thứ 5", budget: "Thỏa thuận theo buổi", notes: "Có thể học nhóm 2 người." },
  { title: "Tìm thầy cô luyện trái tay", content: "Cần sửa trái tay và phòng thủ cuối sân, mong có bài tập rõ ràng để tập thêm.", level: "INTERMEDIATE", goal: "Sửa trái tay và phòng thủ cuối sân", schedule: "Cuối tuần hoặc sau 19:00", budget: "700.000 đồng/tháng", notes: "Ưu tiên HLV gần chi nhánh." },
  { title: "Tìm HLV nâng thể lực cầu lông", content: "Cần giáo án vừa kỹ thuật vừa thể lực để chơi phong trào tốt hơn.", level: "ADVANCED", goal: "Tăng tốc độ, sức bền và khả năng thi đấu", schedule: "Sáng chủ nhật", budget: "Thỏa thuận", notes: "Mong HLV theo sát tiến độ." },
];

const tournamentTemplates = [
  { title: "Mở đăng ký giải cầu lông mở rộng B-Hub", content: "Giải phong trào mở rộng cho thành viên B-Hub và khách mời, ưu tiên tinh thần giao lưu.", categories: ["Đơn nam", "Đôi nam nữ"] },
  { title: "Giải giao lưu phong trào cuối tháng", content: "Mời các cặp đôi đăng ký giải giao lưu cuối tháng, lịch thi đấu sẽ cập nhật trong app.", categories: ["Đôi nam", "Đôi nữ"] },
  { title: "Cập nhật lịch thi đấu giải nội bộ", content: "Ban tổ chức thông báo lịch thi đấu và hạng mục cho giải nội bộ câu lạc bộ.", categories: ["Đồng đội", "Đôi nam nữ"] },
  { title: "Giải cầu lông cấp CLB", content: "Giải dành cho các nhóm tập luyện thường xuyên, có hạng mục đơn và đôi.", categories: ["Đơn nam", "Đơn nữ", "Đôi nam"] },
];

const groupTemplates = [
  { title: "Nhóm cầu lông khu vực Thủ Đức", content: "Nhóm đánh sau giờ làm, lịch ổn định hằng tuần, ưu tiên thành viên gần khu vực.", city: "Hồ Chí Minh", district: "Thủ Đức", slug: "thu-duc", level: "INTERMEDIATE", weekdays: [3, 5, 7], start: "18:00", end: "20:00" },
  { title: "Cộng đồng cầu lông sau giờ làm Quận 7", content: "Tìm thêm thành viên cho nhóm đánh vui vẻ sau giờ làm, có thể ghép cặp đánh đôi.", city: "Hồ Chí Minh", district: "Quận 7", slug: "quan-7", level: "BEGINNER", weekdays: [2, 4, 6], start: "19:00", end: "21:00" },
  { title: "Nhóm người mới tập cầu lông", content: "Nhóm cho người mới, tập nhẹ và chia sẻ kinh nghiệm chọn vợt, giày, cách khởi động.", city: "Hồ Chí Minh", district: "Gò Vấp", slug: "go-vap", level: "BEGINNER", weekdays: [7, 1], start: "08:00", end: "10:00" },
  { title: "Nhóm đánh đôi cố định Tân Bình", content: "Cần thêm thành viên đánh đôi cố định hằng tuần, lịch linh hoạt nếu trùng ngày lễ.", city: "Hồ Chí Minh", district: "Tân Bình", slug: "tan-binh", level: "ADVANCED", weekdays: [3, 6], start: "20:00", end: "22:00" },
];

const specialPostData = ({ type, index, branch, pair, day, contact, review = false, label = "spam" }) => {
  if (type === "FIND_PLAYER") {
    return {
      title: review ? "Can duyet bai pass vot cau long" : `${label === "spam" ? "Tin lap lai tim nguoi choi" : "Bai viet cong kich trong nhom ghep san"} ${u.pad(index, 2)}`,
      content: review
        ? "Noi dung co nhac den pass vot va phu kien, can admin kiem tra truoc khi hien thi."
        : label === "spam"
          ? "Noi dung lap lai nhieu lan ve viec mua ban ngoai cong dong thay vi tim nguoi choi."
          : "Noi dung co dau hieu cong kich nguoi choi khac va khong phu hop quy dinh cong dong.",
      formData: {
        location: pair,
        schedule: { date: day, startTime: "19:00", endTime: "21:00" },
        playerRequirement: { level: "INTERMEDIATE", customLevel: null, slotsNeeded: 2 },
        contact,
        notes: review ? "Can admin xem vi noi dung nghieng ve mua ban." : "Noi dung khong phu hop de hien thi cong khai.",
      },
    };
  }
  if (type === "FIND_COACH") {
    return {
      title: review ? "Can duyet bai order vot Lining Victor" : `${label === "spam" ? "Tin spam tim HLV" : "Bai viet xuc pham HLV"} ${u.pad(index, 2)}`,
      content: review
        ? "Noi dung co nhac order vot va phu kien tu ben ngoai, can admin duyet."
        : label === "spam"
          ? "Noi dung quang ba lap lai khong lien quan den nhu cau tim huan luyen vien."
          : "Noi dung co dau hieu xuc pham huan luyen vien va thanh vien khac.",
      formData: {
        location: { branchId: Number(branch.id) },
        currentLevel: "BEGINNER",
        goal: "Can ho tro ky thuat co ban",
        scheduleNote: "Toi cuoi tuan",
        budget: "Thoa thuan",
        contact,
        notes: review ? "Can kiem tra yeu to mua ban ngoai nen tang." : "Noi dung bi chan boi moderation.",
      },
    };
  }
  if (type === "CLASS") {
    return {
      title: review ? "Can duyet noi dung nhan cang vot" : `${label === "spam" ? "Tin spam lop cau long" : "Bai viet cong kich hoc vien"} ${u.pad(index, 2)}`,
      content: review
        ? "Noi dung lop co chen dich vu cang vot, thay day va quan can, can admin duyet."
        : label === "spam"
          ? "Noi dung lap lai de quang ba dich vu khong dung muc dich lop hoc."
          : "Noi dung co dau hieu cong kich hoc vien va khong phu hop cong dong.",
      formData: {
        inputLevel: "BEGINNER",
        ageRange: "15-25 tuoi",
        schedule: { weekdays: [2, 4, 6], startTime: "19:00", endTime: "21:00", startDate: day },
        location: { branchId: Number(branch.id) },
        maxStudents: 10,
        tuitionFee: "2 trieu dong/khoa",
        contact: { inAppChat: true, phone: contact.phone, zalo: contact.zalo },
        notes: review ? "Can admin duyet vi noi dung co dich vu ngoai." : "Noi dung bi chan boi moderation.",
      },
    };
  }
  if (type === "TOURNAMENT") {
    return {
      title: review ? "Can duyet bai ban ao team trong giai dau" : `${label === "spam" ? "Tin spam giai dau" : "Bai viet xuc pham doi thu"} ${u.pad(index, 2)}`,
      content: review
        ? "Thong bao giai co chen noi dung ban ao team, can admin kiem tra truoc khi cong khai."
        : label === "spam"
          ? "Noi dung lap lai keu goi ngoai le va khong phu hop thong tin giai dau."
          : "Noi dung co dau hieu xuc pham doi thu va ban to chuc.",
      formData: {
        organizerName: "B-Hub Badminton",
        location: pair,
        registration: { startDate: day, endDate: u.dateOnly(u.addDays(new Date(`${day}T12:00:00+07:00`), 7)) },
        eventDate: u.dateOnly(u.addDays(new Date(`${day}T12:00:00+07:00`), 14)),
        categories: ["Don nam", "Doi nam nu"],
        contact: { phone: contact.phone, email: "moderation-demo@bhub.local", inApp: true },
      },
    };
  }
  return {
    title: review ? "Can duyet bai shop ban giay vot" : `${label === "spam" ? "Tin spam nhom cau long" : "Bai viet cong kich thanh vien"} ${u.pad(index, 2)}`,
    content: review
      ? "Noi dung nhom co dau hieu quang cao shop ban giay va vot, can admin duyet."
      : label === "spam"
        ? "Noi dung lap lai nhieu lan de quang cao ngoai muc dich sinh hoat nhom."
        : "Noi dung co dau hieu cong kich thanh vien trong nhom.",
    formData: {
      area: { city: "Ho Chi Minh", district: "Go Vap" },
      weeklySchedule: { weekdays: [3, 5, 7], startTime: "18:00", endTime: "20:00" },
      levelWanted: "INTERMEDIATE",
      contact: { inApp: true, zaloGroupLink: "https://zalo.me/g/bhub-moderation-demo" },
    },
  };
};

const seedCoachClasses = async (qi, Sequelize) => u.phaseTransaction(qi, async (transaction) => {
  await u.deleteChat(qi, transaction);
  await u.deleteSocial(qi, transaction);
  const users = await getPostSeedUsers(qi, Sequelize, transaction);
  const { branches } = await getPostSeedLocations(qi, Sequelize, transaction);
  const coaches = users.filter((row) => row.roleName === "COACH");
  const customers = users.filter((row) => row.roleName === "USER");
  const classAuthors = coaches.length ? coaches : users;
  if (!classAuthors.length) throw new Error("Seed Posts requires at least one active user.");
  if (!customers.length) throw new Error("Seed coach classes requires at least one USER for enrollments.");
  const posts = [];
  // CLASS should be authored by COACH users. If the database has no COACH yet, reuse any valid user so the seed can still run.
  for (let i = 1; i <= 40; i += 1) {
    const plan = classPlans[(i - 1) % classPlans.length];
    const coach = classAuthors[(i - 1) % classAuthors.length];
    const branch = branches[(i - 1) % branches.length];
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    const startDate = u.dateOnly(u.addDays(new Date("2026-07-01T12:00:00+07:00"), i + (i % 5)));
    posts.push(buildPostRow({
      authorId: coach.id,
      type: "CLASS",
      title: `${u.MARKER} ${plan.title} ${u.pad(i, 3)}`,
      content: `${u.MARKER} ${plan.content}`,
      formData: {
        inputLevel: plan.level,
        ageRange: plan.ageRange,
        schedule: {
          weekdays: plan.weekdays,
          startTime: plan.start,
          endTime: plan.end,
          startDate,
        },
        location: { branchId: Number(branch.id) },
        maxStudents: 8 + (i % 7),
        tuitionFee: plan.fee,
        contact: {
          inAppChat: true,
          phone: postContact(i).phone,
          zalo: postContact(i).zalo,
        },
        notes: plan.notes,
      },
      createdAt,
      index: i,
    }));
  }
  await u.insert(qi, "Posts", posts, transaction);
  const dbPosts = await u.q(qi, Sequelize, "SELECT * FROM Posts WHERE title LIKE :note AND type = 'CLASS'", { note: `%${u.MARKER}%` }, transaction);
  const conversations = dbPosts.map((p, i) => ({ conversationName: `${u.MARKER} Lop cau long ${u.pad(i + 1, 3)}`, avatar: u.avatar, type: "GROUP", createdAt: p.createdAt, updatedAt: p.createdAt }));
  await u.insert(qi, "Conversations", conversations, transaction);
  const dbConvs = await u.q(qi, Sequelize, "SELECT * FROM Conversations WHERE conversationName LIKE :name ORDER BY id", { name: `%${u.MARKER} Lop cau long%` }, transaction);
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
      enrollments.push({ postId: p.id, coachUserId: p.authorId, studentUserId: student.id, status: i % 5 === 0 ? "COMPLETED" : u.weighted([["ACTIVE", 76], ["PENDING", 12], ["REJECTED", 6], ["CANCELLED", 6]]), source: "POST_REGISTER", coachNote: `${u.MARKER} Dang ky lop cau long`, rejectReason: null, createdAt, updatedAt: createdAt });
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
  const users = await getPostSeedUsers(qi, Sequelize, transaction);
  const { branches, courtPairs } = await getPostSeedLocations(qi, Sequelize, transaction);
  const authors = users.filter((row) => ["USER", "COACH"].includes(row.roleName));
  const postAuthors = authors.length ? authors : users;
  if (!postAuthors.length) throw new Error("Seed Posts requires at least one active user.");
  const posts = [];
  for (let i = 1; i <= 160; i += 1) {
    const author = postAuthors[(i - 1) % postAuthors.length];
    const createdAt = u.dateTime(u.randomDate(), u.publicHour(), u.int(0, 59));
    const group = Math.floor((i - 1) / 40);
    const indexInType = ((i - 1) % 40) + 1;
    const pair = courtPairs[(i - 1) % courtPairs.length];
    const branch = branches[(i - 1) % branches.length];
    const day = u.dateOnly(u.addDays(new Date("2026-06-25T12:00:00+07:00"), indexInType + group * 3));
    const contact = postContact(100 + i);
    if (group === 0) {
      const item = findPlayerTemplates[(indexInType - 1) % findPlayerTemplates.length];
      posts.push(buildPostRow({
        authorId: author.id,
        type: "FIND_PLAYER",
        title: `${u.MARKER} ${item.title} ${u.pad(indexInType, 3)}`,
        content: `${u.MARKER} ${item.content}`,
        formData: {
          location: pair,
          schedule: {
            date: day,
            startTime: `${18 + (indexInType % 3)}:00`,
            endTime: `${20 + (indexInType % 3)}:00`,
          },
          playerRequirement: {
            level: item.level,
            customLevel: null,
            slotsNeeded: item.slots,
          },
          contact,
          notes: item.notes,
        },
        createdAt,
        index: i,
      }));
    } else if (group === 1) {
      const item = findCoachTemplates[(indexInType - 1) % findCoachTemplates.length];
      posts.push(buildPostRow({
        authorId: author.id,
        type: "FIND_COACH",
        title: `${u.MARKER} ${item.title} ${u.pad(indexInType, 3)}`,
        content: `${u.MARKER} ${item.content}`,
        formData: {
          location: { branchId: Number(branch.id) },
          currentLevel: item.level,
          goal: item.goal,
          scheduleNote: item.schedule,
          budget: item.budget,
          contact,
          notes: item.notes,
        },
        createdAt,
        index: i,
      }));
    } else if (group === 2) {
      const item = tournamentTemplates[(indexInType - 1) % tournamentTemplates.length];
      posts.push(buildPostRow({
        authorId: author.id,
        type: "TOURNAMENT",
        title: `${u.MARKER} ${item.title} ${u.pad(indexInType, 3)}`,
        content: `${u.MARKER} ${item.content}`,
        formData: {
          organizerName: "B-Hub Badminton",
          location: pair,
          registration: {
            startDate: day,
            endDate: u.dateOnly(u.addDays(new Date(`${day}T12:00:00+07:00`), 10)),
          },
          eventDate: u.dateOnly(u.addDays(new Date(`${day}T12:00:00+07:00`), 20)),
          categories: item.categories,
          contact: {
            phone: contact.phone,
            email: "tournament@bhub.vn",
            inApp: true,
          },
        },
        createdAt,
        index: i,
      }));
    } else {
      const item = groupTemplates[(indexInType - 1) % groupTemplates.length];
      posts.push(buildPostRow({
        authorId: author.id,
        type: "GROUP",
        title: `${u.MARKER} ${item.title} ${u.pad(indexInType, 3)}`,
        content: `${u.MARKER} ${item.content}`,
        formData: {
          area: {
            city: item.city,
            district: item.district,
          },
          weeklySchedule: {
            weekdays: item.weekdays,
            startTime: item.start,
            endTime: item.end,
          },
          levelWanted: item.level,
          contact: {
            inApp: true,
            zaloGroupLink: `https://zalo.me/g/bhub-${item.slug}-${u.pad(indexInType, 2)}`,
          },
        },
        createdAt,
        index: i,
      }));
    }
  }

  const reviewTypes = ["GROUP", "CLASS", "TOURNAMENT", "FIND_PLAYER", "FIND_COACH"];
  reviewTypes.forEach((type, offset) => {
    const specialIndex = 201 + offset;
    const author = postAuthors[(offset + 4) % postAuthors.length];
    const pair = courtPairs[(offset + 11) % courtPairs.length];
    const branch = branches[(offset + 3) % branches.length];
    const day = u.dateOnly(u.addDays(new Date("2026-07-20T12:00:00+07:00"), offset));
    const data = specialPostData({ type, index: specialIndex, branch, pair, day, contact: postContact(500 + offset), review: true });
    const createdAt = u.dateTime(u.addDays(new Date("2026-06-18T12:00:00+07:00"), offset), 10 + offset, 0);
    posts.push(buildPostRow({
      authorId: author.id,
      type,
      title: `${u.MARKER} ${data.title}`,
      content: `${u.MARKER} ${data.content}`,
      formData: data.formData,
      createdAt,
      index: specialIndex,
      isActive: false,
      moderation: {
        moderationStatus: "REVIEW_REQUIRED",
        moderationLabel: "unauthorized_ad",
        moderationConfidence: Number((0.9 + offset * 0.01).toFixed(2)),
        moderationAction: "REVIEW",
        moderationReason: "Noi dung co dau hieu quang cao trai phep, can quan tri vien duyet.",
      },
    }));
  });

  const moderationAuthors = [postAuthors[1], postAuthors[2], postAuthors[3]].filter(Boolean);
  const rejectedPlan = [
    ...Array.from({ length: 2 }, (_, i) => ({ author: moderationAuthors[0] || postAuthors[0], label: i % 2 === 0 ? "spam" : "offensive" })),
    ...Array.from({ length: 3 }, (_, i) => ({ author: moderationAuthors[1] || postAuthors[0], label: i % 2 === 0 ? "spam" : "offensive" })),
    ...Array.from({ length: 5 }, (_, i) => ({ author: moderationAuthors[2] || postAuthors[0], label: i % 2 === 0 ? "spam" : "offensive" })),
  ];
  const rejectedTypes = ["FIND_PLAYER", "FIND_COACH", "GROUP", "TOURNAMENT", "CLASS"];
  rejectedPlan.forEach((plan, offset) => {
    const type = rejectedTypes[offset % rejectedTypes.length];
    const specialIndex = 301 + offset;
    const pair = courtPairs[(offset + 21) % courtPairs.length];
    const branch = branches[(offset + 7) % branches.length];
    const day = u.dateOnly(u.addDays(new Date("2026-07-25T12:00:00+07:00"), offset));
    const data = specialPostData({ type, index: specialIndex, branch, pair, day, contact: postContact(700 + offset), label: plan.label });
    const createdAt = u.dateTime(u.addDays(new Date("2026-06-20T12:00:00+07:00"), offset % 3), 13 + (offset % 5), 15);
    posts.push(buildPostRow({
      authorId: plan.author.id,
      type,
      title: `${u.MARKER} ${data.title}`,
      content: `${u.MARKER} ${data.content}`,
      formData: data.formData,
      createdAt,
      index: specialIndex,
      isActive: false,
      moderation: {
        moderationStatus: "REJECTED",
        moderationLabel: plan.label,
        moderationConfidence: Number((0.91 + (offset % 8) * 0.01).toFixed(2)),
        moderationAction: "BLOCK",
        moderationReason: plan.label === "spam"
          ? "Noi dung co dau hieu spam."
          : "Noi dung co dau hieu cong kich hoac xuc pham.",
      },
    }));
  });

  await u.insert(qi, "Posts", posts, transaction);
  const dbPosts = await u.q(qi, Sequelize, "SELECT * FROM Posts WHERE title LIKE :note AND type <> 'CLASS'", { note: `%${u.MARKER}%` }, transaction);
  const likes = [], shares = [], comments = [];
  dbPosts.filter((post) => post.isActive).forEach((post, i) => {
    const likeCount = i % 17 === 0 ? 35 : i % 5 === 0 ? 14 : u.int(2, 9);
    for (let j = 0; j < likeCount; j += 1) {
      const user = users[(i * 13 + j) % users.length];
      if (user.id === post.authorId) continue;
      const createdAt = u.addMinutes(new Date(post.createdAt), 10 + j);
      likes.push({ userId: user.id, postId: post.id, reactionType: u.weighted([["LIKE", 70], ["LOVE", 15], ["HAHA", 6], ["WOW", 5], ["SAD", 2], ["ANGRY", 2]]), createdAt, updatedAt: createdAt });
    }
    if (i % 2 === 0) shares.push({ userId: users[(i * 7) % users.length].id, postId: post.id, type: "SHARE", content: `${u.MARKER} Chia se bai viet cau long huu ich`, createdAt: u.addMinutes(new Date(post.createdAt), 120), updatedAt: u.addMinutes(new Date(post.createdAt), 120) });
    const commentCount = i % 11 === 0 ? 18 : u.int(2, 7);
    for (let j = 0; j < commentCount; j += 1) {
      comments.push({ parentId: null, authorId: users[(i * 9 + j) % users.length].id, postId: post.id, content: `${u.MARKER} Minh quan tam bai nay, cho minh xin them thong tin ${u.pad(j, 2)}`, type: "COMMENT", isDeleted: false, deletedAt: null, createdAt: u.addMinutes(new Date(post.createdAt), 30 + j * 4), updatedAt: u.addMinutes(new Date(post.createdAt), 30 + j * 4) });
    }
  });
  const likeSeen = new Set();
  await u.insert(qi, "PostLikes", likes.filter((l) => { const key = `${l.userId}-${l.postId}`; if (likeSeen.has(key)) return false; likeSeen.add(key); return true; }).slice(0, 2400), transaction);
  await u.insert(qi, "PostShares", shares.slice(0, 300), transaction);
  await u.insert(qi, "Comments", comments.slice(0, 1100), transaction);
  const rejectedPosts = await u.q(qi, Sequelize, `
    SELECT id, authorId, moderationLabel, moderationConfidence, moderationReason, moderatedAt
    FROM Posts
    WHERE title LIKE :note AND moderationStatus = 'REJECTED'
  `, { note: `%${u.MARKER}%` }, transaction);
  await u.insert(qi, "UserModerationViolations", rejectedPosts.map((post) => ({
    userId: post.authorId,
    postId: post.id,
    targetType: "POST",
    targetId: post.id,
    label: post.moderationLabel,
    action: "BLOCK",
    confidence: post.moderationConfidence,
    reason: post.moderationReason,
    source: "AI",
    createdAt: post.moderatedAt || new Date(),
    updatedAt: post.moderatedAt || new Date(),
  })), transaction);
  await applyDemoModerationAccountStatus(qi, Sequelize, transaction);
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
