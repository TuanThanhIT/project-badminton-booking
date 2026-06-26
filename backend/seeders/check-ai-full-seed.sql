-- Kiểm tra sau khi DROP DB → migrate → npm run seed (fresh install)
-- File: backend/seeders/check-ai-full-seed.sql

-- 1) Tài khoản: chỉ demo_user, KHÔNG demo_customer_
SELECT 'demo_user (USER)' AS metric, COUNT(*) AS total
FROM Users u
JOIN Roles r ON r.id = u.roleId AND r.roleName = 'USER'
WHERE u.username LIKE 'demo_user%'
UNION ALL
SELECT 'demo_customer (nên = 0)', COUNT(*)
FROM Users WHERE username LIKE 'demo_customer_%'
UNION ALL
SELECT 'demo_user @bhub.local', COUNT(*)
FROM Users WHERE username LIKE 'demo_user%' AND email LIKE '%@bhub.local';

-- 2) AI bulk training (marker AI-BULK-TRAIN) — calibrated 40 demo_user
SELECT 'AI-BULK bookings' AS metric, COUNT(*) AS total
FROM Bookings WHERE note LIKE '%AI-BULK-TRAIN%'
UNION ALL
SELECT 'AI-BULK orders PAID', COUNT(*)
FROM OrderGroups WHERE note LIKE '%AI-BULK-TRAIN%' AND status = 'PAID'
UNION ALL
SELECT 'AI-PRODUCT-PATTERN PAID', COUNT(*)
FROM OrderGroups WHERE note LIKE '%AI-PRODUCT-PATTERN%' AND status = 'PAID'
UNION ALL
SELECT 'AI-PATTERN bookings', COUNT(*)
FROM Bookings WHERE note LIKE '%AI-PATTERN%'
UNION ALL
SELECT 'AI-OCCUPANCY-SKEW bookings', COUNT(*)
FROM Bookings WHERE note LIKE '%AI-OCCUPANCY-SKEW%'
UNION ALL
SELECT 'DEMO bookings (3m)', COUNT(*)
FROM Bookings WHERE note LIKE '%DEMO-BOOKING-%'
UNION ALL
SELECT 'DEMO order groups (3m)', COUNT(*)
FROM OrderGroups WHERE note LIKE '%DEMO-ORDER-GROUP-%';

-- 3) Booking bulk theo chi nhánh (30 ngày)
SELECT b.branchId, br.branchName, COUNT(*) AS bulk_bookings
FROM Bookings b
JOIN Branches br ON br.id = b.branchId
WHERE b.note LIKE '%AI-BULK-TRAIN%'
  AND b.bookingStatus IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')
GROUP BY b.branchId, br.branchName
ORDER BY b.branchId;

-- 4) Combo mua kèm (KIT)
SELECT COUNT(*) AS kit_orders
FROM OrderGroups
WHERE note LIKE '%AI-BULK-TRAIN% KIT-%' AND status = 'PAID';

-- 5) Persona demo_user1 / demo_user2 có đơn AI-PRODUCT?
SELECT u.username, COUNT(og.id) AS persona_orders
FROM Users u
LEFT JOIN OrderGroups og ON og.userId = u.id AND og.note LIKE '%AI-PRODUCT-PATTERN% PERSONA%'
WHERE u.username IN ('demo_user1', 'demo_user2')
GROUP BY u.username;
