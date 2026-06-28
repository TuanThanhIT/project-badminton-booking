"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");
const linkPath = path.join(rootDir, "seeders", "data", "product-image-links.json");
const reportPath = path.join(rootDir, "seeders", "reports", "shopvnb-product-image-refresh-report.md");

const seedData = require(seedPath);
const linkData = require(linkPath);

const stripVietnamese = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const slugify = (value) =>
  stripVietnamese(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unique = (items) => [...new Set(items.filter(Boolean))];

const categoriesById = new Map(seedData.categories.map((category) => [category.id, category]));

const cdnUrl = (url) =>
  String(url || "")
    .replace("https://cdn.shopvnb.com/img/300x300/", "https://cdn.shopvnb.com/")
    .split("?")[0];

const fileSlug = (url) => {
  const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
  return slugify(fileName.replace(/\.(webp|jpg|jpeg|png)$/i, ""));
};

const productSlug = (url) =>
  fileSlug(url)
    .replace(/_\d+$/i, "")
    .replace(/-(?:[1-9]|1\d)$/i, "");

const legacyUrlToShopVnb = (url) => {
  const fileName = String(url || "").split("?")[0].split("/").pop();
  if (!fileName || !/\.(webp|jpg|jpeg|png)$/i.test(fileName)) return "";
  const normalizedFileName = fileName.replace(/(_\d+)(?:_[a-z0-9]{5,})?(\.[a-z0-9]+)$/i, "$1$2");
  return `https://cdn.shopvnb.com/uploads/gallery/${normalizedFileName}`;
};

const typeMatchers = [
  {
    key: "racket",
    menuTokens: ["vot-cau-long"],
    matches: (slug) => slug.includes("vot-cau-long"),
  },
  {
    key: "shoe",
    menuTokens: ["giay-cau-long"],
    matches: (slug) => slug.includes("giay-cau-long"),
  },
  {
    key: "shirt",
    menuTokens: ["ao-cau-long"],
    matches: (slug) => slug.includes("ao-cau-long") || slug.includes("ao-the-thao"),
  },
  {
    key: "skirt",
    menuTokens: ["vay-cau-long"],
    matches: (slug) => slug.includes("vay-cau-long"),
  },
  {
    key: "shorts",
    menuTokens: ["quan-cau-long"],
    matches: (slug) => slug.includes("quan-cau-long"),
  },
  {
    key: "bag",
    menuTokens: ["tui-vot-cau-long", "tui-dung-giay"],
    matches: (slug) => slug.includes("tui") && !slug.includes("balo"),
  },
  {
    key: "backpack",
    menuTokens: ["balo-cau-long"],
    matches: (slug) => slug.includes("balo-cau-long"),
  },
];

const accessoryMatchers = [
  ["vo-cau-long", (slug) => slug.includes("vo-cau-long") || slug.includes("tat-cau-long")],
  ["cuoc-dan-vot-cau-long", (slug) => slug.includes("cuoc") || slug.includes("day-cuoc")],
  ["qua-cau-long", (slug) => slug.includes("qua-cau-long") || slug.includes("ong-cau-long")],
  ["banh-power-ball", (slug) => slug.includes("power-ball") || slug.includes("bong-tap")],
  ["binh-nuoc-cau-long", (slug) => slug.includes("binh-nuoc")],
  ["bang-bo-co", (slug) => slug.includes("bang-goi") || slug.includes("bang-co-chan") || slug.includes("bang-khuyu")],
  ["moc-khoa-cau-long", (slug) => slug.includes("moc-khoa") || slug.includes("moc-khoc")],
  ["quan-can-cau-long", (slug) => slug.includes("quan-can")],
  ["lot-giay-cau-long", (slug) => slug.includes("lot-giay") || slug.includes("de-lot")],
  ["bang-chan-mo-hoi", (slug) => slug.includes("bang-tran") || slug.includes("bang-co-tay")],
];

const brandTokens = [
  "alien-armour",
  "donex-pro",
  "donexpro",
  "flypower",
  "babolat",
  "sunbatta",
  "promax",
  "proace",
  "apacs",
  "kumpoo",
  "kamito",
  "victec",
  "adonex",
  "yonex",
  "victor",
  "lining",
  "li-ning",
  "mizuno",
  "kawasaki",
  "kason",
  "forza",
  "taro",
  "vnb",
  "sfd",
  "vs",
];

const categoryKey = (category) => `${category.menuGroup} / ${category.cateName}`;

const detectBrandToken = (categoryName) => {
  const slug = slugify(categoryName);
  return brandTokens.find((token) => `-${slug}-`.includes(`-${token}-`)) || "";
};

const getTypeMatcher = (category) => {
  const menuSlug = slugify(category.menuGroup);
  const categorySlug = slugify(category.cateName);
  if (menuSlug.includes("phu-kien")) {
    const matcher = accessoryMatchers.find(([token]) => categorySlug.includes(token));
    return {
      key: matcher?.[0] || "accessory",
      menuTokens: [categorySlug],
      matches: matcher?.[1] || (() => true),
    };
  }
  return (
    typeMatchers.find((matcher) =>
      matcher.menuTokens.some((token) => menuSlug.includes(token) || categorySlug.includes(token)),
    ) || typeMatchers[0]
  );
};

const categoryUrlCandidates = (category) => {
  const categorySlug = slugify(category.cateName);
  const menuSlug = slugify(category.menuGroup);
  const brand = detectBrandToken(category.cateName);
  const type = getTypeMatcher(category);

  return unique([
    `https://shopvnb.com/${categorySlug}.html`,
    ...(brand ? type.menuTokens.map((token) => `https://shopvnb.com/${token}-${brand}.html`) : []),
    ...type.menuTokens.map((token) => `https://shopvnb.com/${token}.html`),
    `https://shopvnb.com/${menuSlug}.html`,
  ]);
};

const extractImageUrls = (html) =>
  unique(
    [...String(html).matchAll(/https:\/\/cdn\.shopvnb\.com\/[^"'\s<>]+/g)]
      .map((match) => cdnUrl(match[0]))
      .filter((url) => /\/uploads\/(?:san_pham|gallery)\//.test(url))
      .filter((url) => /\.(webp|jpg|jpeg|png)$/i.test(url)),
  );

const fetchHtml = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    },
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
};

const groupImages = (urls) => {
  const groups = new Map();
  for (const url of urls) {
    const slug = productSlug(url);
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug).push(url);
  }
  return [...groups.entries()].map(([slug, imageUrls]) => ({
    slug,
    imageUrls: unique(imageUrls).slice(0, 5),
  }));
};

const legacyCdnGroups = (category) => {
  const type = getTypeMatcher(category);
  const brand = detectBrandToken(category.cateName);
  const urls = [];

  for (const list of Object.values(linkData.groups || {})) {
    urls.push(...list);
  }
  for (const product of seedData.products) {
    urls.push(product.thumbnailUrl);
  }
  for (const image of seedData.productimages) {
    urls.push(image.imageUrl);
  }

  const converted = unique(urls.map(legacyUrlToShopVnb)).filter((url) => {
    const slug = fileSlug(url);
    const matchesType = type.matches(slug);
    const matchesBrand = !brand || brand === "vnb" || slug.includes(brand);
    return matchesType && matchesBrand;
  });

  const fallback = unique(urls.map(legacyUrlToShopVnb)).filter((url) => type.matches(fileSlug(url)));
  return groupImages(converted.length >= 5 ? converted : fallback);
};

const scrapeCategory = async (category) => {
  const type = getTypeMatcher(category);
  const brand = detectBrandToken(category.cateName);
  const urls = [];
  const visited = [];

  for (const baseUrl of categoryUrlCandidates(category)) {
    for (const pageUrl of [baseUrl, `${baseUrl}?page=2`]) {
      try {
        const html = await fetchHtml(pageUrl);
        visited.push(pageUrl);
        urls.push(...extractImageUrls(html));
      } catch {
        // Some ShopVNB category aliases do not exist; the next candidate usually does.
      }
      if (urls.length >= 90) break;
    }
    if (urls.length >= 90) break;
  }

  const filtered = unique(urls).filter((url) => {
    const slug = fileSlug(url);
    const matchesType = type.matches(slug);
    const matchesBrand = !brand || brand === "vnb" || slug.includes(brand);
    return matchesType && matchesBrand;
  });

  const fallback = unique(urls).filter((url) => type.matches(fileSlug(url)));
  const imageGroups = groupImages(filtered.length >= 5 ? filtered : fallback);

  if (imageGroups.length === 0) {
    imageGroups.push(...legacyCdnGroups(category));
  }

  if (imageGroups.length === 0) {
    throw new Error(`Khong lay duoc anh ShopVNB cho ${categoryKey(category)}`);
  }

  return {
    category,
    imageGroups,
    visited,
    exactBrand: filtered.length >= 5,
  };
};

const runLimited = async (items, limit, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
};

const main = async () => {
  const usedCategoryIds = unique(seedData.products.map((product) => product.categoryId));
  const scraped = new Map();
  const reportRows = [];

  const scrapeResults = await runLimited(usedCategoryIds, 6, async (categoryId) => {
    const category = categoriesById.get(categoryId);
    const result = await scrapeCategory(category);
    console.log(`${categoryKey(category)} -> ${result.imageGroups.length} bo anh`);
    return {
      categoryId,
      category: categoryKey(category),
      imageGroups: result.imageGroups,
      sourceCount: result.imageGroups.length,
      exactBrand: result.exactBrand ? "yes" : "fallback",
      visited: result.visited.join("<br>"),
    };
  });

  for (const result of scrapeResults) {
    scraped.set(result.categoryId, result.imageGroups);
    reportRows.push({
      category: result.category,
      sourceCount: result.sourceCount,
      exactBrand: result.exactBrand,
      visited: result.visited,
    });
  }

  const productsByCategory = new Map();
  for (const product of seedData.products) {
    if (!productsByCategory.has(product.categoryId)) productsByCategory.set(product.categoryId, []);
    productsByCategory.get(product.categoryId).push(product);
  }

  const assignedImages = new Map();
  for (const [categoryId, products] of productsByCategory.entries()) {
    const groups = scraped.get(categoryId);
    [...products]
      .sort((left, right) => left.id - right.id)
      .forEach((product, index) => {
        const group = groups[index % groups.length];
        product.thumbnailUrl = group.imageUrls[0];
        assignedImages.set(product.id, group.imageUrls);
      });
  }

  let imageId = 1;
  seedData.productimages = seedData.products.flatMap((product) =>
    assignedImages.get(product.id).map((imageUrl) => ({
      id: imageId++,
      imageUrl,
      productId: product.id,
    })),
  );

  const serializedProducts = JSON.stringify({
    thumbnails: seedData.products.map((product) => product.thumbnailUrl),
    images: seedData.productimages.map((image) => image.imageUrl),
  });
  const nonShopVnbCount = (serializedProducts.match(/https:\/\/(?!cdn\.shopvnb\.com)/g) || []).length;
  if (nonShopVnbCount > 0) {
    throw new Error(`Con ${nonShopVnbCount} URL anh san pham khong phai cdn.shopvnb.com`);
  }

  fs.writeFileSync(seedPath, `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`, "utf8");

  const reportLines = [
    "# ShopVNB product image refresh",
    "",
    `- Products updated: ${seedData.products.length}`,
    `- Gallery images rebuilt: ${seedData.productimages.length}`,
    `- Non-ShopVNB product image URLs: ${nonShopVnbCount}`,
    "",
    "| Category | Image groups | Brand match | Source pages |",
    "|---|---:|---|---|",
    ...reportRows.map(
      (row) => `| ${row.category} | ${row.sourceCount} | ${row.exactBrand} | ${row.visited} |`,
    ),
    "",
  ];
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportLines.join("\n"), "utf8");

  console.log(`Updated ${seedData.products.length} products`);
  console.log(`Rebuilt ${seedData.productimages.length} product images`);
  console.log(`Report: ${reportPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
