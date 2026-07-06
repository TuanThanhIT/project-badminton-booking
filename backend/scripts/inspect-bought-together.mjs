import dotenv from "dotenv";
import { QueryTypes } from "sequelize";
import sequelize from "../src/config/db.js";

dotenv.config();

const cats = await sequelize.query(
  "SELECT id, cateName, menuGroup FROM Categories ORDER BY id",
  { type: QueryTypes.SELECT },
);
console.log("=== CATEGORIES ===");
for (const c of cats) console.log(c.id, c.menuGroup, "|", c.cateName);

const pairs = await sequelize.query(
  `
    SELECT p1.id AS id1, p1.productName AS name1, c1.cateName AS cat1,
           p2.id AS id2, p2.productName AS name2, c2.cateName AS cat2,
           COUNT(*) AS coCount
    FROM OrderGroups og
    INNER JOIN Orders o ON o.orderGroupId = og.id
    INNER JOIN OrderDetails od1 ON od1.orderId = o.id
    INNER JOIN ProductVariants pv1 ON pv1.id = od1.variantId
    INNER JOIN Products p1 ON p1.id = pv1.productId
    INNER JOIN OrderDetails od2 ON od2.orderId = o.id AND od2.variantId > od1.variantId
    INNER JOIN ProductVariants pv2 ON pv2.id = od2.variantId
    INNER JOIN Products p2 ON p2.id = pv2.productId
    INNER JOIN Categories c1 ON c1.id = p1.categoryId
    INNER JOIN Categories c2 ON c2.id = p2.categoryId
    WHERE og.status = 'PAID'
    GROUP BY p1.id, p1.productName, c1.cateName, p2.id, p2.productName, c2.cateName
    HAVING coCount >= 3
    ORDER BY coCount DESC
    LIMIT 25
  `,
  { type: QueryTypes.SELECT },
);
console.log("\n=== TOP CO-PURCHASE PAIRS (>=3 orders) ===");
for (const r of pairs) {
  console.log(
    r.coCount,
    `[${r.cat1}] ${String(r.name1).slice(0, 40)}`,
    "+",
    `[${r.cat2}] ${String(r.name2).slice(0, 40)}`,
  );
}

const nanoflare = await sequelize.query(
  `
    SELECT p.id, p.productName,
           GROUP_CONCAT(DISTINCT c.cateName ORDER BY c.cateName SEPARATOR ', ') AS boughtWith
    FROM Products p
    LEFT JOIN (
      SELECT pv2.productId AS relatedId, p_anchor.id AS anchorId
      FROM Products p_anchor
      INNER JOIN ProductVariants pv_a ON pv_a.productId = p_anchor.id
      INNER JOIN OrderDetails od_a ON od_a.variantId = pv_a.id
      INNER JOIN Orders o ON o.id = od_a.orderId
      INNER JOIN OrderGroups og ON og.id = o.orderGroupId AND og.status = 'PAID'
      INNER JOIN OrderDetails od_b ON od_b.orderId = o.id AND od_b.variantId != od_a.variantId
      INNER JOIN ProductVariants pv_b ON pv_b.id = od_b.variantId
      INNER JOIN Products p_b ON p_b.id = pv_b.productId
      INNER JOIN ProductVariants pv2 ON pv2.id = od_b.variantId
      WHERE p_anchor.productName LIKE '%Nanoflare Skill%'
    ) rel ON rel.anchorId = p.id
    LEFT JOIN Products p2 ON p2.id = rel.relatedId
    LEFT JOIN Categories c ON c.id = p2.categoryId
    WHERE p.productName LIKE '%Nanoflare Skill%'
    GROUP BY p.id, p.productName
  `,
  { type: QueryTypes.SELECT },
);
console.log("\n=== NANOFLARE RELATED ===");
console.log(nanoflare);

const yonexRackets = await sequelize.query(
  `SELECT p.id, p.productName FROM Products p
   WHERE p.categoryId IN (1) AND p.productName LIKE '%Yonex%'
   ORDER BY p.id LIMIT 5`,
  { type: QueryTypes.SELECT },
);
console.log("\n=== YONEX RACKETS ===");
console.log(yonexRackets);

const sockCo = await sequelize.query(
  `SELECT p1.productName AS racket, p2.productName AS socks, COUNT(*) AS n
   FROM OrderGroups og
   JOIN Orders o ON o.orderGroupId = og.id
   JOIN OrderDetails od1 ON od1.orderId = o.id
   JOIN ProductVariants pv1 ON pv1.id = od1.variantId
   JOIN Products p1 ON p1.id = pv1.productId AND p1.categoryId IN (1,2,3,4,5)
   JOIN OrderDetails od2 ON od2.orderId = o.id AND od2.id != od1.id
   JOIN ProductVariants pv2 ON pv2.id = od2.variantId
   JOIN Products p2 ON p2.id = pv2.productId AND p2.categoryId = 69
   WHERE og.status = 'PAID'
   GROUP BY p1.id, p1.productName, p2.id, p2.productName
   ORDER BY n DESC LIMIT 10`,
  { type: QueryTypes.SELECT },
);
console.log("\n=== RACKET + SOCKS ORDERS ===");
console.log(sockCo.length ? sockCo : "(none)");

await sequelize.close();
