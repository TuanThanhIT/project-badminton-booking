"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "backend", "seeders", "data", "static-seed-data.cjs");
const linkPath = path.join(projectRoot, "backend", "seeders", "data", "product-image-links.json");

const seedData = require(dataPath);
const imageLinks = JSON.parse(fs.readFileSync(linkPath, "utf8"));

const SHOP_VNB_APPAREL_URLS = [
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-23031-nam-vang_1725925626.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-23031-nam-vang-1_1725925631.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-tpm3005-jet-black-chinh-hang_1767668437.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-trm2994-georgia-peach-chinh-hang_1767665738.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-trm2994-snap-dragon-chinh-hang_1767662495.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-trm2994-skipper-blue-chinh-hang_1767665664.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-trm2993-white-skipper-blue-chinh-hang_1767661958.webp",
  "https://cdn.shopvnb.com/uploads/gallery/ao-cau-long-yonex-3308-nam-cam_1725925874.webp",
];

const COLOR_ALIASES = {
  "Đen": [
    "den",
    "black",
    "jet-black",
    "poppy-seed",
    "night-sky",
    "dress-blues",
  ],
  "Trắng": [
    "trang",
    "white",
    "star-white",
    "bright-white",
    "pearl-white",
    "whitecap",
    "cannoli-cream",
  ],
  "Xanh dương": [
    "xanh-duong",
    "xanh-dam",
    "blue",
    "navy",
    "true-blue",
    "skipper",
    "sodalite",
    "indigo",
    "surf-the-web",
    "blue-grotto",
    "twilight-blue",
    "illusion-blue",
  ],
  "Xanh lá": [
    "xanh-la",
    "xanh",
    "green",
    "flash-green",
    "dark-green",
    "hemlock",
    "bird-s-egg-green",
    "lime",
    "turquoise",
  ],
  "Đỏ": [
    "do",
    "red",
    "racing-red",
    "snap-dragon",
  ],
  "Vàng": [
    "vang",
    "yellow",
    "mustard",
    "sulphur",
  ],
  "Cam": [
    "cam",
    "orange",
    "peach",
    "georgia-peach",
    "afterglow",
    "cayenne",
    "sunset",
  ],
  "Hồng": [
    "hong",
    "pink",
    "smoke-pink",
    "rhubarb",
  ],
  "Tím": [
    "tim",
    "purple",
    "lilac",
    "velvet",
  ],
  "Xám": [
    "xam",
    "gray",
    "grey",
    "light-gray",
    "taupe",
    "beige",
    "oyster",
    "mushroom",
    "nimbus",
    "monument",
    "smoked",
    "future-dust",
  ],
};

const COLOR_ORDER = Object.keys(COLOR_ALIASES);

const stripVietnamese = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D");

const toSlug = (value) => stripVietnamese(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const getUrlSlug = (url) => {
  const clean = String(url || "").split("?")[0];
  const file = clean.slice(clean.lastIndexOf("/") + 1);
  return toSlug(file.replace(/\.(webp|jpg|jpeg|png)$/i, ""));
};

const inferGroup = (value) => {
  const text = toSlug(value);
  if (text.includes("ao-cau-long") || text.includes("ao-the-thao")) return "apparel";
  if (text.includes("quan-cau-long")) return "shorts";
  if (text.includes("vay-cau-long")) return "skirt";
  if (text.includes("giay-cau-long")) return "shoe";
  if (text.includes("vot-cau-long")) return "racket";
  if (text.includes("balo-cau-long")) return "backpack";
  if (text.includes("tui") || text.includes("bag")) return "bag";
  return "accessory";
};

const classifyColors = (url) => {
  const slug = getUrlSlug(url);
  const colors = [];
  for (const color of COLOR_ORDER) {
    if (COLOR_ALIASES[color].some((alias) => slug.includes(alias))) {
      colors.push(color);
    }
  }
  return colors.length ? colors : ["__unknown"];
};

const collectUrls = () => {
  const urls = new Set(SHOP_VNB_APPAREL_URLS);

  for (const list of Object.values(imageLinks.groups || {})) {
    for (const url of list) urls.add(url);
  }

  for (const product of seedData.products || []) {
    if (product.thumbnailUrl) urls.add(product.thumbnailUrl);
  }

  for (const image of seedData.productimages || []) {
    if (image.imageUrl) urls.add(image.imageUrl);
  }

  return [...urls].filter((url) => {
    const slug = getUrlSlug(url);
    return !url.includes("placehold.co")
      && !url.includes("/products/thumbnails/")
      && !url.includes("/products/images/")
      && (
        slug.includes("cau-long")
        || slug.includes("badminton")
        || slug.includes("yonex")
        || slug.includes("victor")
        || slug.includes("lining")
        || slug.includes("kawasaki")
        || slug.includes("mizuno")
        || slug.includes("kason")
        || slug.includes("taro")
        || slug.includes("vnb")
      );
  });
};

const buildPools = () => {
  const pools = new Map();
  for (const url of collectUrls()) {
    const group = inferGroup(url);
    for (const color of classifyColors(url)) {
      const key = `${group}:${color}`;
      if (!pools.has(key)) pools.set(key, []);
      pools.get(key).push(url);
    }
  }
  return pools;
};

const getCategoryGroup = (product, categoryById) => {
  const category = categoryById.get(Number(product.categoryId));
  return inferGroup(`${category?.menuGroup || ""} ${category?.cateName || ""} ${product.productName || ""}`);
};

const productColor = (productId, variantsByProduct) => {
  const variants = variantsByProduct.get(Number(productId)) || [];
  const known = variants
    .map((variant) => variant.color)
    .find((color) => COLOR_ORDER.includes(color));
  return known || "Xanh dương";
};

const pickFromPool = (pools, group, color, salt = 0) => {
  const candidates = [
    `${group}:${color}`,
    `accessory:${color}`,
    `apparel:${color}`,
    `racket:${color}`,
    `shoe:${color}`,
    `bag:${color}`,
    `shorts:${color}`,
    `skirt:${color}`,
    `backpack:${color}`,
    `${group}:__unknown`,
  ];

  for (const key of candidates) {
    const list = pools.get(key);
    if (list?.length) return list[salt % list.length];
  }

  const sameGroup = [...pools.entries()].find(([key, list]) => key.startsWith(`${group}:`) && list.length);
  if (sameGroup) return sameGroup[1][salt % sameGroup[1].length];

  const anyColor = [...pools.entries()].find(([key, list]) => key.endsWith(`:${color}`) && list.length);
  if (anyColor) return anyColor[1][salt % anyColor[1].length];

  throw new Error(`No image URL available for group=${group}, color=${color}`);
};

const updateSeedData = () => {
  const pools = buildPools();
  const categoryById = new Map(seedData.categories.map((category) => [Number(category.id), category]));
  const variantsByProduct = new Map();
  const imagesByProduct = new Map();

  for (const variant of seedData.productvariants || []) {
    const productId = Number(variant.productId);
    if (!variantsByProduct.has(productId)) variantsByProduct.set(productId, []);
    variantsByProduct.get(productId).push(variant);
  }

  for (const image of seedData.productimages || []) {
    const productId = Number(image.productId);
    if (!imagesByProduct.has(productId)) imagesByProduct.set(productId, []);
    imagesByProduct.get(productId).push(image);
  }

  let updatedProducts = 0;
  let updatedImages = 0;
  const unmatched = [];

  for (const product of seedData.products || []) {
    const group = getCategoryGroup(product, categoryById);
    const color = productColor(product.id, variantsByProduct);
    const primaryUrl = pickFromPool(pools, group, color, Number(product.id));

    if (product.thumbnailUrl !== primaryUrl) {
      product.thumbnailUrl = primaryUrl;
      updatedProducts += 1;
    }

    const productImages = imagesByProduct.get(Number(product.id)) || [];
    productImages.forEach((image, index) => {
      const nextUrl = pickFromPool(pools, group, color, Number(product.id) + index);
      if (image.imageUrl !== nextUrl) {
        image.imageUrl = nextUrl;
        updatedImages += 1;
      }
    });

    if (!classifyColors(primaryUrl).includes(color)) {
      unmatched.push({ productId: product.id, group, color, url: primaryUrl });
    }
  }

  return { updatedProducts, updatedImages, unmatched, pools };
};

const writeSeedData = () => {
  const payload = `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`;
  fs.writeFileSync(dataPath, payload, "utf8");
};

const main = () => {
  const result = updateSeedData();
  writeSeedData();

  const poolSummary = [...result.pools.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => `${key}=${list.length}`)
    .join(", ");

  console.log(`Updated product thumbnails: ${result.updatedProducts}`);
  console.log(`Updated product images: ${result.updatedImages}`);
  console.log(`Color fallback count: ${result.unmatched.length}`);
  const fallbackSummary = result.unmatched.reduce((summary, item) => {
    const key = `${item.group}:${item.color}`;
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
  console.log(`Fallbacks: ${Object.entries(fallbackSummary).map(([key, value]) => `${key}=${value}`).join(", ")}`);
  console.log(`Pools: ${poolSummary}`);
};

main();
