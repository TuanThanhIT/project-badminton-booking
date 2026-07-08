"use strict";
require("dotenv").config();
const { QueryTypes } = require("sequelize");
const sequelize = require("../src/config/db.js").default;

async function main() {
  const username = process.argv[2] || "demo_user1";
  const { default: aiRecommendationDataService } = await import(
    "../src/services/aiRecommendationDataService.js"
  );
  const { default: aiRecommendationClient } = await import(
    "../src/services/aiRecommendationClient.js"
  );

  const [user] = await sequelize.query(
    "SELECT id, username FROM Users WHERE username = :u",
    { replacements: { u: username }, type: QueryTypes.SELECT },
  );
  if (!user) return console.log("NO_USER");

  const payload = await aiRecommendationDataService.buildProductRecommendPayload({
    mode: "user",
    userId: user.id,
    topK: Number(process.argv[3]) || 12,
  });
  const rec = await aiRecommendationClient.getProductRecommendations(payload);

  const history = payload.history;
  const purchased = new Set(history.map((h) => h.productId));
  const catCounts = {};
  for (const h of history) {
    catCounts[h.categoryId] = (catCounts[h.categoryId] || 0) + 1;
  }

  const catNames = await sequelize.query("SELECT id, cateName FROM Categories", {
    type: QueryTypes.SELECT,
  });
  const catMap = Object.fromEntries(catNames.map((c) => [c.id, c.cateName]));

  console.log("USER:", user.username, "id=", user.id);
  console.log("avgPriceUser:", payload.avgPriceUser);
  console.log(
    "history:",
    history.length,
    "| categories:",
    Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, c]) => `${id}:${catMap[id]}(${c})`)
      .join(", "),
  );
  console.log(
    "strategy:",
    rec.strategy,
    "| modelUsed:",
    rec.modelUsed,
    "| features:",
    (rec.featuresUsed || []).join(", "),
  );
  console.log("\n--- TOP 6 GỢI Ý ---");
  for (const [i, it] of (rec.items || []).entries()) {
    const leak = purchased.has(it.productId) ? "LEAK đã mua!" : "chưa mua OK";
    console.log(
      `${i + 1}. score=${it.score} | cat=${it.categoryId} (${catMap[it.categoryId] || "?"}) | id=${it.productId}`,
    );
    console.log(
      `   price=${it.minPrice} sold=${it.soldCount} | ${leak}`,
    );
    console.log(`   ${(it.productName || "").slice(0, 72)}`);
  }

  const leaks = (rec.items || []).filter((it) => purchased.has(it.productId));
  console.log("\n--- KIỂM TRA ---");
  console.log("Trùng đã mua:", leaks.length === 0 ? "KHÔNG (đúng)" : `CÓ ${leaks.length} (sai)`);

  const recCats = [...new Set((rec.items || []).map((it) => it.categoryId))];
  const boughtCats = Object.keys(catCounts).map(Number);
  const novelCats = recCats.filter((c) => !boughtCats.includes(c));
  const perCat = {};
  for (const it of rec.items || []) {
    perCat[it.categoryId] = (perCat[it.categoryId] || 0) + 1;
  }
  console.log("Danh mục gợi ý:", recCats.map((c) => catMap[c]).join(", "));
  console.log(
    "Số SP / danh mục:",
    Object.entries(perCat)
      .map(([id, n]) => `${catMap[id]}(${n})`)
      .join(", "),
  );
  console.log("maxPerCategory:", rec.maxPerCategory ?? payload.maxPerCategory ?? "?");
  console.log("Danh mục chưa từng mua:", novelCats.map((c) => catMap[c]).join(", ") || "(không)");

  const unwornShirts = payload.products
    .filter((p) => p.categoryId === 21 && !purchased.has(p.id))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);
  console.log("\n--- So sánh: áo chưa mua bán chạy nhất ---");
  for (const p of unwornShirts) {
    const inRec = (rec.items || []).some((it) => it.productId === p.id);
    console.log(
      `  id=${p.id} sold=${p.soldCount} price=${p.minPrice} ${inRec ? "← CÓ trong top6" : ""}`,
    );
    console.log(`  ${(p.name || "").slice(0, 60)}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => sequelize.close());
