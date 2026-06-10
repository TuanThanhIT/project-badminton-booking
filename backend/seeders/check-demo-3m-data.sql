-- Verification queries for [DEMO-SEED-3M] data.
-- Scope: 2026-03-10 00:00:00 to 2026-06-10 23:59:59, Asia/Ho_Chi_Minh.

SET @demo_marker = '%[DEMO-SEED-3M]%';
SET @demo_start = '2026-03-10 00:00:00';
SET @demo_end = '2026-06-10 23:59:59';

-- 1) Demo user totals by role.
SELECT r.name AS roleName, COUNT(*) AS total
FROM Users u
JOIN Roles r ON r.id = u.roleId
WHERE u.username LIKE 'demo_customer_%'
   OR u.username LIKE 'demo_employee_%'
   OR u.username LIKE 'demo_coach_%'
GROUP BY r.name
ORDER BY r.name;

-- 2) Demo users without profile.
SELECT u.id, u.username, u.email, u.phoneNumber
FROM Users u
LEFT JOIN Profiles p ON p.userId = u.id
WHERE (u.username LIKE 'demo_customer_%' OR u.username LIKE 'demo_employee_%' OR u.username LIKE 'demo_coach_%')
  AND p.id IS NULL;

-- 3) Duplicate identity fields among demo users.
SELECT 'username' AS fieldName, username AS value, COUNT(*) AS total FROM Users WHERE username LIKE 'demo_%' GROUP BY username HAVING COUNT(*) > 1
UNION ALL
SELECT 'email', email, COUNT(*) FROM Users WHERE username LIKE 'demo_%' GROUP BY email HAVING COUNT(*) > 1
UNION ALL
SELECT 'phoneNumber', phoneNumber, COUNT(*) FROM Users WHERE username LIKE 'demo_%' GROUP BY phoneNumber HAVING COUNT(*) > 1;

-- 4) Duplicate wallets and negative balances.
SELECT userId, COUNT(*) AS total FROM Wallets GROUP BY userId HAVING COUNT(*) > 1;
SELECT w.* FROM Wallets w JOIN Users u ON u.id = w.userId WHERE u.username LIKE 'demo_%' AND w.balance < 0;

-- 5) Booking distribution by month, branch, status.
SELECT DATE_FORMAT(b.createdAt, '%Y-%m') AS monthKey, b.branchId, b.status, COUNT(*) AS total, SUM(b.totalAmount) AS revenue
FROM Bookings b
WHERE b.note LIKE @demo_marker
GROUP BY DATE_FORMAT(b.createdAt, '%Y-%m'), b.branchId, b.status
ORDER BY monthKey, b.branchId, b.status;

-- 6) Booking details outside parent branch or overlapping same court/time.
SELECT bd.*
FROM BookingDetails bd
JOIN Bookings b ON b.id = bd.bookingId
JOIN Courts c ON c.id = bd.courtId
WHERE b.note LIKE @demo_marker AND c.branchId <> b.branchId;

SELECT a.courtId, a.playDate, a.startTime, a.endTime, a.id AS detailA, b.id AS detailB
FROM BookingDetails a
JOIN BookingDetails b ON b.courtId = a.courtId
  AND b.playDate = a.playDate
  AND b.id > a.id
  AND a.startTime < b.endTime
  AND b.startTime < a.endTime
JOIN Bookings ba ON ba.id = a.bookingId AND ba.note LIKE @demo_marker
JOIN Bookings bb ON bb.id = b.bookingId AND bb.note LIKE @demo_marker
WHERE ba.status NOT IN ('CANCELLED', 'REFUNDED')
  AND bb.status NOT IN ('CANCELLED', 'REFUNDED');

-- 7) Order distribution and amount mismatches.
SELECT DATE_FORMAT(og.createdAt, '%Y-%m') AS monthKey, o.branchId, og.status, COUNT(DISTINCT og.id) AS groups, COUNT(o.id) AS orders, SUM(og.finalAmount) AS groupRevenue
FROM OrderGroups og
JOIN Orders o ON o.orderGroupId = og.id
WHERE og.note LIKE @demo_marker
GROUP BY DATE_FORMAT(og.createdAt, '%Y-%m'), o.branchId, og.status
ORDER BY monthKey, o.branchId, og.status;

SELECT o.id, o.subtotal, COALESCE(SUM(od.subTotal), 0) AS detailSubtotal
FROM Orders o
LEFT JOIN OrderDetails od ON od.orderId = o.id
WHERE o.trackingCode LIKE 'BH-DEMO-%'
GROUP BY o.id, o.subtotal
HAVING ABS(o.subtotal - COALESCE(SUM(od.subTotal), 0)) > 1;

SELECT og.id, og.totalAmount, COALESCE(SUM(o.subtotal), 0) AS orderSubtotal, og.totalShippingFee, COALESCE(SUM(o.shippingFee), 0) AS orderShipping
FROM OrderGroups og
LEFT JOIN Orders o ON o.orderGroupId = og.id
WHERE og.note LIKE @demo_marker
GROUP BY og.id, og.totalAmount, og.totalShippingFee
HAVING ABS(og.totalAmount - COALESCE(SUM(o.subtotal), 0)) > 1
    OR ABS(og.totalShippingFee - COALESCE(SUM(o.shippingFee), 0)) > 1;

SELECT trackingCode, COUNT(*) AS total FROM Orders WHERE trackingCode LIKE 'BH-DEMO-%' GROUP BY trackingCode HAVING COUNT(*) > 1;

-- 8) Shipping logs with status not matching latest order state.
SELECT o.id, o.shippingStatus, MAX(osl.eventTime) AS latestEventTime
FROM Orders o
LEFT JOIN OrderShippingLogs osl ON osl.orderId = o.id
WHERE o.trackingCode LIKE 'BH-DEMO-%'
GROUP BY o.id, o.shippingStatus
HAVING latestEventTime IS NULL;

-- 9) Payment distribution, orphan targets, and invalid refunds.
SELECT paymentMethod, paymentStatus, targetPaymentType, COUNT(*) AS total, SUM(paymentAmount) AS amount
FROM Payments
WHERE externalId LIKE 'DEMO-EXT-%'
GROUP BY paymentMethod, paymentStatus, targetPaymentType
ORDER BY targetPaymentType, paymentMethod, paymentStatus;

SELECT p.*
FROM Payments p
LEFT JOIN Bookings b ON p.targetPaymentType = 'BOOKING' AND p.targetPaymentId = b.id
LEFT JOIN OrderGroups og ON p.targetPaymentType = 'ORDER' AND p.targetPaymentId = og.id
LEFT JOIN Wallets w ON p.targetPaymentType = 'WALLET' AND p.targetPaymentId = w.id
WHERE p.externalId LIKE 'DEMO-EXT-%'
  AND b.id IS NULL AND og.id IS NULL AND w.id IS NULL;

SELECT *
FROM Payments
WHERE externalId LIKE 'DEMO-EXT-%'
  AND ((paymentStatus <> 'REFUNDED' AND refundAmount IS NOT NULL) OR (paymentStatus = 'REFUNDED' AND (refundAmount IS NULL OR refundAt IS NULL)));

-- 10) Work shift consistency.
SELECT wse.*
FROM WorkShiftEmployees wse
JOIN WorkShifts ws ON ws.id = wse.workShiftId
JOIN BranchEmployees be ON be.employeeId = wse.employeeId
WHERE ws.shiftName LIKE @demo_marker AND be.branchId <> ws.branchId;

SELECT * FROM WorkShiftEmployees WHERE checkInTime IS NOT NULL AND checkOutTime IS NOT NULL AND checkInTime > checkOutTime;
SELECT * FROM WorkShifts WHERE shiftName LIKE @demo_marker AND status = 'CANCELLED' AND actualWorkingHours > 0;

-- 11) Coach/class consistency.
SELECT cr.*
FROM ClassRooms cr
LEFT JOIN CoachProfiles cp ON cp.id = cr.coachProfileId
WHERE cr.name LIKE @demo_marker AND cp.id IS NULL;

SELECT classId, userId, COUNT(*) AS total
FROM ClassEnrollments
GROUP BY classId, userId
HAVING COUNT(*) > 1;

-- 12) Social and chat consistency.
SELECT userId, postId, COUNT(*) AS total
FROM PostLikes
GROUP BY userId, postId
HAVING COUNT(*) > 1;

SELECT c.id, c.parentId, c.postId, parent.postId AS parentPostId
FROM Comments c
JOIN Comments parent ON parent.id = c.parentId
WHERE c.postId <> parent.postId;

SELECT m.id, m.conversationId, m.senderId
FROM Messages m
LEFT JOIN ConversationParticipants cp ON cp.conversationId = m.conversationId AND cp.userId = m.senderId
WHERE m.body LIKE @demo_marker AND cp.id IS NULL;

-- 13) Revenue by day/month/branch/source/method.
SELECT DATE(p.createdAt) AS dayKey, p.paymentMethod, p.targetPaymentType, COUNT(*) AS payments, SUM(p.paymentAmount) AS amount
FROM Payments p
WHERE p.externalId LIKE 'DEMO-EXT-%' AND p.paymentStatus = 'PAID'
GROUP BY DATE(p.createdAt), p.paymentMethod, p.targetPaymentType
ORDER BY dayKey, p.targetPaymentType, p.paymentMethod;

SELECT DATE_FORMAT(p.createdAt, '%Y-%m') AS monthKey,
       COALESCE(b.branchId, o.branchId) AS branchId,
       p.targetPaymentType,
       p.paymentMethod,
       COUNT(*) AS payments,
       SUM(p.paymentAmount) AS amount
FROM Payments p
LEFT JOIN Bookings b ON p.targetPaymentType = 'BOOKING' AND p.targetPaymentId = b.id
LEFT JOIN OrderGroups og ON p.targetPaymentType = 'ORDER' AND p.targetPaymentId = og.id
LEFT JOIN Orders o ON o.orderGroupId = og.id
WHERE p.externalId LIKE 'DEMO-EXT-%' AND p.paymentStatus = 'PAID'
GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m'), COALESCE(b.branchId, o.branchId), p.targetPaymentType, p.paymentMethod
ORDER BY monthKey, branchId, p.targetPaymentType, p.paymentMethod;
