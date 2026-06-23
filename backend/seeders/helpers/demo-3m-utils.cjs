"use strict";

const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");

const MARKER = "[DEMO-SEED-3M]";
const RANDOM_SEED = 20260310;
const START = new Date("2026-03-10T00:00:00+07:00");
const END = new Date("2026-06-30T23:59:59+07:00");
const FEEDBACK_END = new Date("2026-06-30T23:59:59+07:00");
const RECENT_CUTOFF = new Date("2026-06-27T00:00:00+07:00");

const STATUS = {
  booking: ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "FAILED"],
  payment: ["UNPAID", "PENDING", "PAID", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"],
  method: ["COD", "CASH", "VNPAY", "BANK", "WALLET"],
  order: ["PENDING", "CONFIRMED", "PREPARING", "READY_TO_SHIP", "SHIPPING", "CANCELLED", "RETURNED", "COMPLETED", "FAILED"],
  shipping: ["PENDING", "CREATED", "PICKING", "PICKED", "IN_TRANSIT", "DELIVERING", "DELIVERED", "FAILED", "RETURNING", "RETURNED", "CANCELLED"],
};

const names = [
  "Nguyen Hoai An", "Tran Minh Khang", "Le Bao Chau", "Pham Gia Huy", "Vo Thanh Truc",
  "Dang Nhat Linh", "Bui Tuan Kiet", "Hoang Minh Quan", "Do Khanh Vy", "Huynh Gia Bao",
  "Ngo Phuong Nam", "Mai Thanh Dat", "Cao Yen Nhi", "Truong Hai Dang", "Phan Kim Ngan",
  "Nguyen Anh Thu", "Tran Quoc Viet", "Le Khanh Ngoc", "Pham Duc Anh", "Vo Minh Tam",
];

const addresses = [
  { address: "12 Nguyen Van Bao", wardName: "Phuong 4", districtName: "Go Vap", provinceName: "Ho Chi Minh", provinceId: 202, districtId: 1444, wardCode: "20308", latitude: 10.826, longitude: 106.682 },
  { address: "45 Nguyen Thi Minh Khai", wardName: "Ben Nghe", districtName: "Quan 1", provinceName: "Ho Chi Minh", provinceId: 202, districtId: 1442, wardCode: "20101", latitude: 10.781, longitude: 106.699 },
  { address: "92 Nguyen Thi Thap", wardName: "Tan Phu", districtName: "Quan 7", provinceName: "Ho Chi Minh", provinceId: 202, districtId: 1447, wardCode: "20508", latitude: 10.741, longitude: 106.711 },
  { address: "120 Cong Hoa", wardName: "Phuong 12", districtName: "Tan Binh", provinceName: "Ho Chi Minh", provinceId: 202, districtId: 1450, wardCode: "20710", latitude: 10.803, longitude: 106.651 },
  { address: "231 Le Van Chi", wardName: "Linh Trung", districtName: "Thu Duc", provinceName: "Ho Chi Minh", provinceId: 202, districtId: 1463, wardCode: "21808", latitude: 10.871, longitude: 106.772 },
];

const avatar = "https://placehold.co/512x512/png?text=B-Hub+Demo";

const createRng = (seed = RANDOM_SEED) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const rng = createRng();
const rand = () => rng();
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (items) => items[int(0, items.length - 1)];
const money = (value) => Math.max(0, Math.round(Number(value || 0) / 1000) * 1000);
const pad = (value, size = 3) => String(value).padStart(size, "0");
const dateOnly = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
const dateTime = (date, hour = 0, minute = 0) => {
  const d = new Date(date);
  d.setHours(hour, minute, int(0, 50), 0);
  return d;
};
const time = (hour, minute = 0) => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
const weighted = (pairs) => {
  const total = pairs.reduce((sum, item) => sum + item[1], 0);
  let roll = rand() * total;
  for (const [value, weight] of pairs) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
};
const randomDate = () => {
  const days = Math.floor((END - START) / 86400000);
  const offset = int(0, days);
  const d = addDays(START, offset);
  const month = d.getMonth();
  const multiplier = month === 4 ? 1.18 : month === 3 ? 1.05 : 1;
  if (rand() > multiplier / 1.2) return randomDate();
  return d;
};
const spreadDate = (index, total, start = START, end = END) => {
  if (total <= 1) return new Date(end);
  const days = Math.floor((end - start) / 86400000);
  const offset = Math.round((Math.max(0, index) * days) / (total - 1));
  return addDays(start, Math.min(days, offset));
};
const bookingHour = () => weighted([[6, 12], [7, 10], [8, 8], [10, 5], [14, 7], [17, 16], [18, 18], [19, 20], [20, 18], [21, 13]]);
const publicHour = () => int(8, 23);
const chunk = (arr, size = 500) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const q = async (qi, Sequelize, sql, replacements = {}, transaction) =>
  qi.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT, replacements, transaction });
const exec = async (qi, sql, replacements = {}, transaction) =>
  qi.sequelize.query(sql, { replacements, transaction });
const insert = async (qi, table, rows, transaction) => {
  for (const part of chunk(rows)) {
    if (part.length) await qi.bulkInsert(table, part, { transaction });
  }
};
const del = async (qi, table, where, transaction) => qi.bulkDelete(table, where, { transaction });

const getRoleIds = async (qi, Sequelize, transaction) => {
  const rows = await q(qi, Sequelize, "SELECT id, roleName FROM Roles", {}, transaction);
  return Object.fromEntries(rows.map((r) => [r.roleName, Number(r.id)]));
};

const getDemoUsers = async (qi, Sequelize, transaction) =>
  q(qi, Sequelize, `
    SELECT u.id, u.username, u.roleId, r.roleName, p.fullName, p.phoneNumber
    FROM Users u
    JOIN Roles r ON r.id = u.roleId
    LEFT JOIN Profiles p ON p.userId = u.id
    WHERE u.email LIKE '%@bhub.local' OR u.username LIKE 'demo\\_%'
    ORDER BY u.id
  `, {}, transaction);

const phaseTransaction = async (qi, fn) => {
  const transaction = await qi.sequelize.transaction();
  try {
    const result = await fn(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deletePaymentsByExternal = async (qi, transaction) => {
  const rows = await qi.sequelize.query("SELECT id FROM Payments WHERE externalId LIKE 'DEMO-EXT-%'", {
    type: QueryTypes.SELECT,
    transaction,
  });
  const ids = rows.map((r) => Number(r.id));
  if (ids.length) await del(qi, "WalletTransactions", { paymentId: ids }, transaction);
  if (ids.length) await del(qi, "Payments", { id: ids }, transaction);
};

const deleteBookings = async (qi, transaction) => {
  const bookingRows = await qi.sequelize.query("SELECT id FROM Bookings WHERE note LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const bookingIds = bookingRows.map((r) => Number(r.id));
  const monthlyRows = await qi.sequelize.query("SELECT id FROM MonthlyBookings WHERE note LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const monthlyIds = monthlyRows.map((r) => Number(r.id));
  if (bookingIds.length || monthlyIds.length) {
    await del(qi, "BookingDetails", { ...(bookingIds.length ? { bookingId: bookingIds } : { monthlyBookingId: monthlyIds }) }, transaction);
    if (bookingIds.length && monthlyIds.length) {
      await del(qi, "BookingDetails", { monthlyBookingId: monthlyIds }, transaction);
    }
  }
  if (monthlyIds.length) await del(qi, "MonthlyBookings", { id: monthlyIds }, transaction);
  if (bookingIds.length) await del(qi, "Bookings", { id: bookingIds }, transaction);
};

const deleteOrders = async (qi, transaction) => {
  const groups = await qi.sequelize.query("SELECT id FROM OrderGroups WHERE note LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const groupIds = groups.map((r) => Number(r.id));
  if (!groupIds.length) return;
  const orders = await qi.sequelize.query("SELECT id FROM Orders WHERE orderGroupId IN (:ids)", {
    type: QueryTypes.SELECT,
    replacements: { ids: groupIds },
    transaction,
  });
  const orderIds = orders.map((r) => Number(r.id));
  if (orderIds.length) {
    await del(qi, "OrderShippingLogs", { orderId: orderIds }, transaction);
    await del(qi, "OrderDetails", { orderId: orderIds }, transaction);
    await del(qi, "Orders", { id: orderIds }, transaction);
  }
  await del(qi, "OrderGroups", { id: groupIds }, transaction);
};

const deleteCounter = async (qi, transaction) => {
  const drafts = await qi.sequelize.query("SELECT id FROM DraftBookings WHERE note LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const ids = drafts.map((r) => Number(r.id));
  if (!ids.length) return;
  await del(qi, "OfflineBookings", { draftId: ids }, transaction);
  await del(qi, "DraftProductItems", { draftId: ids }, transaction);
  await del(qi, "DraftBeverageItems", { draftId: ids }, transaction);
  await del(qi, "DraftBookingItems", { draftId: ids }, transaction);
  await del(qi, "DraftBookings", { id: ids }, transaction);
};

const deleteSocial = async (qi, transaction) => {
  const posts = await qi.sequelize.query("SELECT id FROM Posts WHERE title LIKE :note OR content LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const postIds = posts.map((r) => Number(r.id));
  if (!postIds.length) return;
  const comments = await qi.sequelize.query("SELECT id FROM Comments WHERE postId IN (:postIds)", {
    type: QueryTypes.SELECT,
    replacements: { postIds },
    transaction,
  });
  const commentIds = comments.map((r) => Number(r.id));
  if (commentIds.length) await del(qi, "Comments", { parentId: commentIds }, transaction);
  await del(qi, "UserModerationViolations", { postId: postIds }, transaction).catch(() => {});
  await del(qi, "Comments", { postId: postIds }, transaction);
  await del(qi, "PostLikes", { postId: postIds }, transaction);
  await del(qi, "PostShares", { postId: postIds }, transaction);
  await del(qi, "ClassEnrollments", { postId: postIds }, transaction);
  await del(qi, "ClassRooms", { postId: postIds }, transaction);
  await del(qi, "Posts", { id: postIds }, transaction);
};

const deleteChat = async (qi, transaction) => {
  const convs = await qi.sequelize.query("SELECT id FROM Conversations WHERE conversationName LIKE :note", {
    type: QueryTypes.SELECT,
    replacements: { note: `%${MARKER}%` },
    transaction,
  });
  const ids = convs.map((r) => Number(r.id));
  if (!ids.length) return;
  await del(qi, "Messages", { conversationId: ids }, transaction);
  await del(qi, "ConversationParticipants", { conversationId: ids }, transaction);
  await exec(qi, "UPDATE ClassRooms SET conversationId = NULL WHERE conversationId IN (:ids)", { ids }, transaction);
  await del(qi, "Conversations", { id: ids }, transaction);
};

const cleanupUsers = async (qi, transaction) => {
  const users = await qi.sequelize.query(`
    SELECT id FROM Users
    WHERE username LIKE 'demo\\_customer\\_%'
       OR username LIKE 'demo\\_employee\\_%'
       OR username LIKE 'demo\\_coach\\_%'
  `, { type: QueryTypes.SELECT, transaction });
  const ids = users.map((r) => Number(r.id));
  if (!ids.length) return;
  await del(qi, "UserModerationViolations", { userId: ids }, transaction).catch(() => {});
  await del(qi, "BranchEmployees", { employeeId: ids }, transaction);
  await del(qi, "CoachProfiles", { userId: ids }, transaction);
  await del(qi, "CoachApplications", { userId: ids }, transaction);
  await del(qi, "UserAddresses", { userId: ids }, transaction);
  await del(qi, "Profiles", { userId: ids }, transaction);
  await del(qi, "Wallets", { userId: ids }, transaction);
  await del(qi, "Users", { id: ids }, transaction);
};

module.exports = {
  MARKER, RANDOM_SEED, START, END, FEEDBACK_END, RECENT_CUTOFF, STATUS, addresses, avatar, names,
  rand, int, pick, money, pad, dateOnly, dateTime, addMinutes, addDays, time,
  weighted, randomDate, spreadDate, bookingHour, publicHour, q, exec, insert, del,
  getRoleIds, getDemoUsers, phaseTransaction, deletePaymentsByExternal,
  deleteBookings, deleteOrders, deleteCounter, deleteSocial, deleteChat,
  cleanupUsers, bcrypt,
};
