-- Static seed verification queries.

SELECT id, roleName FROM Roles ORDER BY id;

SELECT r.roleName, COUNT(u.id) AS totalUsers
FROM Roles r
LEFT JOIN Users u ON u.roleId = r.id
GROUP BY r.id, r.roleName
ORDER BY r.id;

SELECT username, COUNT(*) AS total FROM Users GROUP BY username HAVING COUNT(*) > 1;
SELECT email, COUNT(*) AS total FROM Users GROUP BY email HAVING COUNT(*) > 1;
SELECT userId, COUNT(*) AS total FROM Profiles GROUP BY userId HAVING COUNT(*) > 1;

SELECT id, branchName, address, districtName, wardName, ghnShopId, isActive
FROM Branches
ORDER BY id;

SELECT b.branchName, COUNT(c.id) AS courtCount
FROM Branches b
LEFT JOIN Courts c ON c.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT branchId, dayOfWeek, startTime, endTime, price
FROM CourtPrices
ORDER BY branchId, dayOfWeek, startTime;

SELECT c.cateName, COUNT(p.id) AS productCount
FROM Categories c
LEFT JOIN Products p ON p.categoryId = c.id
GROUP BY c.id, c.cateName
HAVING COUNT(p.id) < 15;

SELECT p.productName, COUNT(pi.id) AS imageCount
FROM Products p
LEFT JOIN ProductImages pi ON pi.productId = p.id
GROUP BY p.id, p.productName
HAVING COUNT(pi.id) = 0;

SELECT p.productName, COUNT(pv.id) AS variantCount
FROM Products p
LEFT JOIN ProductVariants pv ON pv.productId = p.id
GROUP BY p.id, p.productName
HAVING COUNT(pv.id) = 0;

SELECT sku, COUNT(*) AS total FROM ProductVariants GROUP BY sku HAVING COUNT(*) > 1;

SELECT b.branchName, COUNT(vs.id) AS stockRows, SUM(vs.stock) AS totalStock
FROM Branches b
LEFT JOIN VariantStocks vs ON vs.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT variantId, branchId, COUNT(*) AS total
FROM VariantStocks
GROUP BY variantId, branchId
HAVING COUNT(*) > 1;

SELECT b.branchName, COUNT(bs.id) AS stockRows, SUM(bs.stock) AS totalStock
FROM Branches b
LEFT JOIN BeverageStocks bs ON bs.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT beverageId, branchId, COUNT(*) AS total
FROM BeverageStocks
GROUP BY beverageId, branchId
HAVING COUNT(*) > 1;

SELECT code, COUNT(*) AS total FROM Discounts GROUP BY code HAVING COUNT(*) > 1;

SELECT bm.*
FROM BranchManagers bm
JOIN Users u ON u.id = bm.managerId
JOIN Roles r ON r.id = u.roleId
WHERE r.roleName <> 'MANAGER';

SELECT be.*
FROM BranchEmployees be
JOIN Users u ON u.id = be.employeeId
JOIN Roles r ON r.id = u.roleId
WHERE r.roleName <> 'EMPLOYEE';
