"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const backendDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(backendDir, "..");
const outputPath = path.join(
  rootDir,
  "ai-service",
  "data",
  "processed",
  "products.csv",
);

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const main = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: (process.env.DB_NAME || "badminton_booking").trim(),
  });

  try {
    const [rows] = await connection.execute(`
      SELECT
        p.id AS product_id,
        p.productName AS name,
        p.brand AS brand,
        c.cateName AS category,
        GROUP_CONCAT(DISTINCT pv.color ORDER BY pv.color SEPARATOR ', ') AS color,
        p.description AS description,
        COALESCE(NULLIF(p.thumbnailUrl, ''), MIN(pi.imageUrl)) AS image_url,
        CONCAT('/product/', p.id) AS product_url,
        MIN(pv.price) AS price
      FROM Products p
      LEFT JOIN Categories c ON c.id = p.categoryId
      LEFT JOIN ProductVariants pv ON pv.productId = p.id
      LEFT JOIN ProductImages pi ON pi.productId = p.id
      GROUP BY p.id, p.productName, p.brand, c.cateName, p.description, p.thumbnailUrl
      HAVING image_url IS NOT NULL AND image_url <> ''
      ORDER BY p.id ASC
    `);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const headers = [
      "product_id",
      "name",
      "brand",
      "category",
      "color",
      "description",
      "image_url",
      "product_url",
      "price",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
    ];

    fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
    console.log(`Exported ${rows.length} products to ${outputPath}`);
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
