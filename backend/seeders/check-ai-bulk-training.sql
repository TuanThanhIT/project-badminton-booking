-- Verify [DEMO-SEED-3M] AI-BULK-TRAIN data for AI features.

SET @bulk = '%AI-BULK-TRAIN%';

-- 1) Tổng booking / đơn PAID
SELECT 'bookings' AS metric, COUNT(*) AS total
FROM Bookings WHERE note LIKE @bulk
UNION ALL
SELECT 'paid_order_groups', COUNT(*)
FROM OrderGroups WHERE note LIKE @bulk AND status = 'PAID';

-- 2) Booking theo chi nhánh
SELECT b.branchId, br.branchName, COUNT(*) AS bookings
FROM Bookings b
JOIN Branches br ON br.id = b.branchId
WHERE b.note LIKE @bulk
GROUP BY b.branchId, br.branchName
ORDER BY b.branchId;

-- 3) Occupancy 30 ngày (Admin insights — giờ trống khuyến mãi)
SELECT b.branchId,
       br.branchName,
       HOUR(bd.startTime) AS hour,
       COUNT(bd.id) AS bookedCount
FROM BookingDetails bd
JOIN Bookings b ON b.id = bd.bookingId
JOIN Branches br ON br.id = b.branchId
WHERE b.note LIKE @bulk
  AND b.bookingStatus IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')
  AND bd.playDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY b.branchId, br.branchName, HOUR(bd.startTime)
ORDER BY b.branchId, hour;

-- 4) Combo mua kèm (đơn KIT)
SELECT COUNT(*) AS kit_orders
FROM OrderGroups
WHERE note LIKE '%AI-BULK-TRAIN% KIT-%' AND status = 'PAID';

-- 5) Persona orders
SELECT
  SUBSTRING_INDEX(SUBSTRING_INDEX(note, 'PERSONA-', -1), '-', 1) AS persona_key,
  COUNT(*) AS orders
FROM OrderGroups
WHERE note LIKE '%AI-BULK-TRAIN% PERSONA-%'
GROUP BY persona_key
ORDER BY orders DESC;
