"use strict";

const TARGET_PRODUCTS_PER_CATEGORY = 15;
const SKU_PREFIX = "BH-DEMO";
const SEED_DATE = new Date("2026-06-10T00:00:00");

const BRAND_NAMES = [
  "Yonex",
  "Victor",
  "Li-Ning",
  "Mizuno",
  "Kumpoo",
  "Apacs",
  "Kawasaki",
  "Proace",
  "Adidas",
  "Nike",
  "Asics",
  "Joola",
  "Kamito",
  "VS",
  "VNB",
  "Forza",
  "FlyPower",
  "Promax",
  "Sunbatta",
  "Babolat",
  "DonexPro",
  "Donex Pro",
  "Alien Armour",
  "SFD",
  "Victec",
  "Taro",
  "Vina Authentic",
  "Kason",
  "Adonex",
  "B-Hub",
];

const CATEGORY_CODES = {
  racket: "RACKET",
  shoes: "SHOES",
  shirt: "SHIRT",
  shorts: "SHORTS",
  skirt: "SKIRT",
  bag: "BAG",
  backpack: "BACKPACK",
  socks: "SOCKS",
  string: "STRING",
  shuttle: "SHUTTLE",
  support: "SUPPORT",
  training: "TRAINING",
  drink: "DRINK",
  accessory: "ACCESSORY",
};

const PRODUCT_SERIES = {
  racket: [
    "Astrox 88D Pro",
    "Nanoflare 700 Tour",
    "Arcsaber 11 Play",
    "Thruster K Falcon",
    "Auraspeed 90K II",
    "DriveX 10 Metallic",
    "Axforce 80",
    "Tectonic 7C",
    "Halbertec 8000",
    "Fortius 20",
    "Feather Weight 55",
    "Ziggler LHI Pro",
    "Honor S6",
    "Power Strike 900",
    "Precision Tour 750",
    "Rapid Control 68",
    "Phantom Speed 9",
    "Blade Master 77",
    "Energy Boost 100",
    "Storm Breaker 70",
  ],
  shoes: [
    "Power Cushion 65Z3",
    "Eclipsion Z3",
    "Aerus Z2",
    "P9200TD",
    "A950 Ace",
    "Wave Claw Neo 3",
    "Wave Fang 2",
    "Blade FF Court",
    "Speedcourt Pro",
    "Court Control Elite",
    "Sonic Indoor 88",
    "Rapid Step 600",
    "Light Move Ace",
    "Grip Runner Pro",
    "Stability Tour 5",
    "Nova Court Max",
    "Swift Attack 3",
    "Cross Speed 100",
    "Air Court Edge",
    "Shadow Indoor X",
  ],
  shirt: [
    "Tournament Polo 101",
    "Aero Dry Tee 202",
    "Pro Fit Jersey 303",
    "Team Match Shirt 404",
    "Elite Court Tee 505",
    "Light Move Top 606",
    "Training Dry Shirt 707",
    "Club Performance Tee 808",
    "Feather Knit Polo 909",
    "Energy Mesh Shirt 110",
    "Rapid Cool Tee 210",
    "Court Flex Polo 310",
    "Active Match Shirt 410",
    "Premium Dry Top 510",
    "Speed Air Tee 610",
    "Classic Team Polo 710",
    "Pro Vent Shirt 810",
    "Motion Fit Tee 910",
  ],
  shorts: [
    "Court Flex Shorts 101",
    "Aero Dry Shorts 202",
    "Pro Match Shorts 303",
    "Team Training Shorts 404",
    "Elite Movement Shorts 505",
    "Light Move Shorts 606",
    "Club Performance Shorts 707",
    "Feather Knit Shorts 808",
    "Energy Mesh Shorts 909",
    "Rapid Cool Shorts 110",
    "Active Match Shorts 210",
    "Premium Dry Shorts 310",
    "Speed Air Shorts 410",
    "Classic Team Shorts 510",
    "Motion Fit Shorts 610",
  ],
  skirt: [
    "Active Skirt 101",
    "Aero Dry Skirt 202",
    "Pro Match Skirt 303",
    "Team Training Skirt 404",
    "Elite Movement Skirt 505",
    "Light Move Skirt 606",
    "Club Performance Skirt 707",
    "Feather Knit Skirt 808",
    "Energy Mesh Skirt 909",
    "Rapid Cool Skirt 110",
    "Premium Dry Skirt 210",
    "Speed Air Skirt 310",
    "Classic Team Skirt 410",
    "Motion Fit Skirt 510",
    "Court Flow Skirt 610",
  ],
  bag: [
    "Pro Tournament Bag 92031",
    "BR9608 Court Bag",
    "Team 3 Compartment Bag",
    "Active 6 Racket Bag",
    "Thermo Guard Bag 9826",
    "Elite Duffle 75",
    "Club Court Bag 802",
    "Aero Racket Bag 903",
    "Travel Match Bag 604",
    "Tour Gear Bag 505",
    "Power Carry Bag 406",
    "Rapid Pack Bag 307",
    "Premium Court Bag 208",
    "Compact Racket Bag 109",
    "All Court Bag 700",
  ],
  backpack: [
    "Team Backpack 102",
    "Aero Court Backpack 203",
    "Pro Gear Backpack 304",
    "Club Training Backpack 405",
    "Elite Carry Backpack 506",
    "Light Move Backpack 607",
    "Tour Daypack 708",
    "Compact Court Backpack 809",
    "Power Pack Backpack 910",
    "Rapid Move Backpack 111",
    "Active Sport Backpack 212",
    "Premium Match Backpack 313",
    "Travel Court Backpack 414",
    "Training Gear Backpack 515",
    "All Court Backpack 616",
  ],
  socks: [
    "Performance Socks 3 Pair",
    "Court Grip Socks",
    "Aero Dry Socks",
    "Training Crew Socks",
    "Elite Ankle Socks",
    "Light Cushion Socks",
    "Club Sport Socks",
    "Rapid Cool Socks",
    "Premium Cotton Socks",
    "Active Match Socks",
    "Pro Fit Socks",
    "Speed Air Socks",
    "Classic Team Socks",
    "Motion Fit Socks",
    "Feather Knit Socks",
  ],
  string: [
    "BG66 Ultimax",
    "BG80 Power",
    "Exbolt 63",
    "VBS-66 Nano",
    "No.1 Boost",
    "KSB 65 Titanium",
    "Power String 70",
    "Control String 66",
    "Repulsion String 68",
    "Durable String 75",
    "Tournament String 69",
    "Rapid Snap String 66",
    "Elite Feel String 70",
    "Precision String 67",
    "Hybrid String 72",
  ],
  shuttle: [
    "Aerosensa 30",
    "Aerosensa 50",
    "Master Ace Shuttle",
    "Gold Champion Shuttle",
    "Training Shuttle 12",
    "Tournament Shuttle Pro",
    "Club Shuttle 77",
    "Feather Shuttle 99",
    "Practice Shuttle 88",
    "Elite Flight Shuttle",
    "Stable Fly Shuttle",
    "Rapid Speed Shuttle",
    "Durable Cork Shuttle",
    "Match Day Shuttle",
    "Premium Goose Shuttle",
  ],
  support: [
    "Knee Support Pro",
    "Elbow Support Fit",
    "Wrist Support Guard",
    "Ankle Wrap Active",
    "Muscle Tape Roll",
    "Compression Calf Sleeve",
    "Sport Bandage 5M",
    "Recovery Wrap",
    "Elastic Guard Pro",
    "Training Support Kit",
    "Flex Tape Advanced",
    "Court Safety Wrap",
    "Light Support Sleeve",
    "Premium Sport Tape",
    "Active Guard Set",
  ],
  training: [
    "Reaction Ball Set",
    "Speed Ladder Pro",
    "Jump Rope Elite",
    "Agility Cone Set",
    "Grip Trainer",
    "Footwork Marker Kit",
    "Resistance Band Set",
    "Balance Board Trainer",
    "Reflex Training Kit",
    "Warmup Rope 3M",
    "Court Marker Set",
    "Power Wrist Trainer",
    "Core Training Ring",
    "Mini Hurdle Set",
    "Coach Whistle Kit",
  ],
  drink: [
    "Sport Bottle 750ml",
    "Hydration Bottle 1L",
    "Electrolyte Mix Lemon",
    "Energy Gel Citrus",
    "Recovery Drink Powder",
    "Isotonic Pack 6",
    "Mineral Water Sport",
    "Cooling Towel Bottle Set",
    "Protein Shake Vanilla",
    "Match Day Hydration Kit",
  ],
  accessory: [
    "Grip Tape Super Tacky",
    "Overgrip Comfort 3 Pack",
    "Keychain Shuttle",
    "Towel Cotton Pro",
    "Racket Cover Basic",
    "Headband Sport",
    "Wristband Pro Pair",
    "Water Bottle Holder",
    "Shoe Bag Compact",
    "Court Towel Premium",
    "Grip Powder Dry",
    "Racket Stencil Ink",
    "Training Notebook",
    "Score Counter Mini",
    "Accessory Pouch",
  ],
};

const PRICE_RANGES = {
  racket: [500000, 4500000],
  shoes: [700000, 3500000],
  shirt: [180000, 900000],
  shorts: [180000, 700000],
  skirt: [180000, 750000],
  bag: [300000, 2500000],
  backpack: [300000, 1800000],
  socks: [50000, 250000],
  string: [90000, 350000],
  shuttle: [180000, 850000],
  support: [50000, 500000],
  training: [80000, 1000000],
  drink: [15000, 250000],
  accessory: [50000, 1000000],
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const detectProductType = (category) => {
  const text = normalizeText(`${category.cateName} ${category.menuGroup}`);

  if (text.includes("vot cau long")) return "racket";
  if (text.includes("giay")) return "shoes";
  if (text.includes("ao")) return "shirt";
  if (text.includes("quan")) return "shorts";
  if (text.includes("vay")) return "skirt";
  if (text.includes("tui")) return "bag";
  if (text.includes("balo")) return "backpack";
  if (text.includes("vo cau long")) return "socks";
  if (text.includes("cuoc") || text.includes("day dan")) return "string";
  if (text.includes("qua cau")) return "shuttle";
  if (text.includes("bang bo")) return "support";
  if (text.includes("tap luyen") || text.includes("banh power")) return "training";
  if (text.includes("nuoc") || text.includes("do uong")) return "drink";

  return "accessory";
};

const detectBrand = (category, categoryIndex, productIndex) => {
  const text = normalizeText(`${category.cateName} ${category.menuGroup}`);
  const explicitBrand = BRAND_NAMES.find((brand) =>
    text.includes(normalizeText(brand)),
  );

  if (explicitBrand) return explicitBrand;

  const typeBrands = {
    racket: ["Yonex", "Victor", "Li-Ning", "Mizuno", "Kumpoo", "Apacs"],
    shoes: ["Yonex", "Victor", "Li-Ning", "Mizuno", "Asics", "Adidas"],
    shirt: ["Yonex", "Victor", "Li-Ning", "Kamito", "Adidas"],
    shorts: ["Yonex", "Victor", "Li-Ning", "Kamito", "Adidas"],
    skirt: ["Yonex", "Victor", "Li-Ning", "Kamito"],
    bag: ["Yonex", "Victor", "Li-Ning", "Kawasaki"],
    backpack: ["Yonex", "Victor", "Li-Ning", "Kawasaki", "Kamito"],
    accessory: ["Yonex", "Victor", "Li-Ning", "Kawasaki", "B-Hub"],
  };
  const productType = detectProductType(category);
  const pool = typeBrands[productType] || typeBrands.accessory;

  return pool[(categoryIndex + productIndex) % pool.length];
};

const slugPart = (value) =>
  normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);

const createExampleImage = (text) =>
  `https://placehold.co/800x800/png?text=${encodeURIComponent(text)}`;

const buildDescription = ({ productName, brand, type, categoryName }) => {
  const textByType = {
    racket:
      "mẫu vợt cân bằng tốt, khung graphite bền và phù hợp người chơi trung cấp đến nâng cao.",
    shoes:
      "đôi giày bám sân ổn định, đệm êm và hỗ trợ di chuyển ngang trong sân trong nhà.",
    shirt:
      "áo cầu lông vải polyester nhanh khô, form thể thao và phù hợp tập luyện hằng ngày.",
    shorts:
      "quần cầu lông nhẹ, co giãn tốt và giúp người chơi thoải mái khi bứt tốc trên sân.",
    skirt:
      "váy cầu lông nhẹ, thoáng và có lớp trong tiện lợi cho các buổi tập và thi đấu.",
    bag:
      "túi đựng vợt nhiều ngăn, chất liệu polyester/PU bền và dễ sắp xếp giày, vợt, phụ kiện.",
    backpack:
      "balo cầu lông gọn nhẹ, có ngăn riêng cho vợt và vật dụng cá nhân khi đi tập.",
    socks:
      "vớ cầu lông có đệm êm, thoáng khí và giúp giảm trượt trong giày khi vận động nhanh.",
    string:
      "cước đan vợt có độ nảy tốt, cảm giác đánh rõ và phù hợp cả tập luyện lẫn thi đấu.",
    shuttle:
      "quả cầu có đường bay ổn định, đầu cầu chắc và phù hợp cho câu lạc bộ hoặc lớp học.",
    support:
      "phụ kiện hỗ trợ cơ khớp, chất liệu co giãn và phù hợp khởi động, hồi phục sau trận.",
    training:
      "dụng cụ tập luyện giúp cải thiện phản xạ, footwork và thể lực cho người chơi cầu lông.",
    drink:
      "sản phẩm bổ sung nước và năng lượng, tiện dùng cho người chơi trước và sau buổi tập.",
    accessory:
      "phụ kiện cầu lông thiết thực, dễ bán kèm với vợt, giày và các đơn hàng tại quầy.",
  };

  return `<h2>${productName}</h2><p>${productName} là sản phẩm ${categoryName} của ${brand}, ${textByType[type]}</p><ul><li>Thiết kế cho người chơi phong trào, học viên và người chơi bán chuyên.</li><li>Chất liệu được chọn theo đúng công năng của từng nhóm sản phẩm.</li><li>Dữ liệu demo phù hợp để kiểm thử xem chi tiết, chọn biến thể, đặt hàng và thống kê doanh thu.</li></ul>`;
};

const roundPrice = (value) => Math.round(value / 10000) * 10000;

const getTierRatio = (index) => {
  const bucket = index % 20;
  if (bucket < 6) return 0.18 + bucket * 0.018;
  if (bucket < 15) return 0.42 + (bucket - 6) * 0.025;
  if (bucket < 19) return 0.72 + (bucket - 15) * 0.045;
  return 0.95;
};

const buildBasePrice = (type, index) => {
  const [min, max] = PRICE_RANGES[type] || PRICE_RANGES.accessory;
  return roundPrice(min + (max - min) * getTierRatio(index));
};

const buildVariants = ({ type, categoryCode, productIndex, productName }) => {
  const shortProduct = slugPart(productName).replace(/-/g, "").slice(0, 12);
  const baseSku = `${SKU_PREFIX}-${categoryCode}-${String(productIndex + 1).padStart(3, "0")}-${shortProduct}`;
  const basePrice = buildBasePrice(type, productIndex);
  const variantTemplates = {
    racket: [
      { size: "4U-G5", color: "Đen", material: "Graphite", weight: 0.083 },
      { size: "4U-G6", color: "Xanh", material: "Graphite", weight: 0.084 },
      { size: "3U-G5", color: "Trắng", material: "Graphite", weight: 0.089 },
    ],
    shoes: [
      { size: "39", color: "Trắng", material: "Mesh, Rubber", weight: 0.72 },
      { size: "40", color: "Đen", material: "Synthetic Leather, Rubber", weight: 0.76 },
      { size: "41", color: "Trắng", material: "Mesh, Rubber", weight: 0.8 },
      { size: "42", color: "Xanh navy", material: "Synthetic Leather, Rubber", weight: 0.86 },
    ],
    shirt: [
      { size: "S", color: "Xanh", material: "Polyester Dry-fit", weight: 0.22 },
      { size: "M", color: "Trắng", material: "Polyester Dry-fit", weight: 0.24 },
      { size: "L", color: "Đen", material: "Polyester Dry-fit", weight: 0.26 },
      { size: "XL", color: "Đỏ", material: "Polyester Dry-fit", weight: 0.28 },
    ],
    shorts: [
      { size: "M", color: "Đen", material: "Polyester", weight: 0.24 },
      { size: "L", color: "Xanh navy", material: "Polyester", weight: 0.26 },
      { size: "XL", color: "Trắng", material: "Polyester", weight: 0.28 },
    ],
    skirt: [
      { size: "S", color: "Trắng", material: "Polyester Dry-fit", weight: 0.25 },
      { size: "M", color: "Đen", material: "Polyester Dry-fit", weight: 0.27 },
      { size: "L", color: "Xanh", material: "Polyester Dry-fit", weight: 0.29 },
    ],
    bag: [
      { size: "3 compartments", color: "Đen", material: "Polyester, PU", weight: 0.9 },
      { size: "6 rackets", color: "Xanh", material: "Polyester, PU", weight: 1.1 },
      { size: "2 compartments", color: "Trắng", material: "Polyester, PU", weight: 0.75 },
    ],
    backpack: [
      { size: "25L", color: "Đen", material: "Polyester, PU", weight: 0.65 },
      { size: "30L", color: "Xanh", material: "Polyester, PU", weight: 0.75 },
      { size: "35L", color: "Grey", material: "Polyester, PU", weight: 0.85 },
    ],
    socks: [
      { size: "M", color: "Trắng", material: "Cotton, Spandex", weight: 0.12 },
      { size: "L", color: "Đen", material: "Cotton, Spandex", weight: 0.13 },
    ],
    string: [
      { size: "0.63mm", color: "Trắng", material: "Nylon Multifilament", weight: 0.05 },
      { size: "0.66mm", color: "Yellow", material: "Nylon Multifilament", weight: 0.05 },
    ],
    shuttle: [
      { size: "Speed 76", color: "Trắng", material: "Feather, Cork", weight: 0.18 },
      { size: "Speed 77", color: "Trắng", material: "Feather, Cork", weight: 0.18 },
    ],
    support: [
      { size: "M", color: "Đen", material: "Elastic Nylon", weight: 0.18 },
      { size: "L", color: "Xanh", material: "Elastic Nylon", weight: 0.2 },
    ],
    training: [
      { size: "Standard", color: "Xanh", material: "PVC, Rubber", weight: 0.5 },
      { size: "Pro", color: "Orange", material: "PVC, Rubber", weight: 0.75 },
    ],
    drink: [
      { size: "Single", color: "Original", material: "Food Grade Packaging", weight: 0.5 },
      { size: "Pack", color: "Mixed", material: "Food Grade Packaging", weight: 1.2 },
    ],
    accessory: [
      { size: "Standard", color: "Đen", material: "Polyester", weight: 0.2 },
      { size: "Pro", color: "Xanh", material: "Polyester", weight: 0.25 },
    ],
  };

  const templates = variantTemplates[type] || variantTemplates.accessory;

  return templates.map((template, index) => ({
    sku: `${baseSku}-${String(index + 1).padStart(2, "0")}`.slice(0, 255),
    price: roundPrice(basePrice + index * 20000),
    discount: [0, 0, 0, 5, 0, 10, 0, 15, 0, 20][
      (productIndex + index) % 10
    ],
    ...template,
  }));
};

const buildStock = ({ branchIndex, productIndex, variantIndex, premium }) => {
  if ((productIndex + variantIndex + branchIndex) % 19 === 0) {
    return (productIndex + variantIndex + branchIndex) % 6;
  }

  const ranges = [
    [15, 60],
    [12, 48],
    [10, 42],
    [8, 36],
    [5, 30],
  ];
  const [min, max] = ranges[branchIndex % ranges.length];
  const spread = max - min;
  const base = min + ((productIndex * 7 + variantIndex * 5 + branchIndex * 3) % (spread + 1));

  return premium ? Math.max(5, Math.floor(base * 0.65)) : base;
};

const buildCandidateProduct = (category, categoryIndex, productIndex) => {
  const type = detectProductType(category);
  const brand = detectBrand(category, categoryIndex, productIndex);
  const series = PRODUCT_SERIES[type] || PRODUCT_SERIES.accessory;
  const model = series[productIndex % series.length];
  const suffix = productIndex >= series.length ? ` ${Math.floor(productIndex / series.length) + 1}` : "";
  const productName = `${brand} ${model}${suffix}`;
  const categoryCode = `${CATEGORY_CODES[type]}-${slugPart(brand).slice(0, 8)}`;

  return {
    productName,
    brand,
    description: buildDescription({
      productName,
      brand,
      type,
      categoryName: category.cateName,
    }),
    thumbnailUrl: createExampleImage(productName),
    categoryId: category.id,
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
    type,
    categoryCode,
  };
};

const findAvailableProducts = ({
  category,
  categoryIndex,
  existingNames,
  missingCount,
}) => {
  const products = [];
  let productIndex = 0;

  while (products.length < missingCount && productIndex < 200) {
    const candidate = buildCandidateProduct(category, categoryIndex, productIndex);
    if (!existingNames.has(candidate.productName)) {
      products.push(candidate);
      existingNames.add(candidate.productName);
    }
    productIndex += 1;
  }

  if (products.length < missingCount) {
    throw new Error(`Not enough unique product names for category ${category.cateName}`);
  }

  return products;
};

const selectAll = async (queryInterface, Sequelize, sql, replacements = {}, transaction) =>
  queryInterface.sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
    replacements,
    transaction,
  });

const bulkInsert = async (queryInterface, tableName, rows, transaction) => {
  if (!rows.length) return;
  const chunkSize = 500;
  for (let index = 0; index < rows.length; index += chunkSize) {
    await queryInterface.bulkInsert(
      tableName,
      rows.slice(index, index + chunkSize),
      { transaction },
    );
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const categories = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT id, cateName, menuGroup
          FROM Categories
          ORDER BY id ASC
        `,
        {},
        transaction,
      );
      const branches = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT id, branchName
          FROM Branches
          ORDER BY id ASC
        `,
        {},
        transaction,
      );

      if (!categories.length || !branches.length) {
        await transaction.commit();
        return;
      }

      const productCounts = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT categoryId, COUNT(*) AS productCount
          FROM Products
          GROUP BY categoryId
        `,
        {},
        transaction,
      );
      const countByCategoryId = new Map(
        productCounts.map((row) => [Number(row.categoryId), Number(row.productCount)]),
      );

      const existingProducts = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT id, productName
          FROM Products
        `,
        {},
        transaction,
      );
      const existingNames = new Set(existingProducts.map((item) => item.productName));

      const productsToCreate = categories.flatMap((category, categoryIndex) => {
        const currentCount = countByCategoryId.get(Number(category.id)) || 0;
        const missingCount = Math.max(0, TARGET_PRODUCTS_PER_CATEGORY - currentCount);

        return findAvailableProducts({
          category,
          categoryIndex,
          existingNames,
          missingCount,
        });
      });

      await bulkInsert(
        queryInterface,
        "Products",
        productsToCreate.map(({ type, categoryCode, ...product }) => product),
        transaction,
      );

      const createdProductNames = productsToCreate.map((product) => product.productName);
      const createdProducts = createdProductNames.length
        ? await selectAll(
            queryInterface,
            Sequelize,
            `
              SELECT id, productName
              FROM Products
              WHERE productName IN (:productNames)
            `,
            { productNames: createdProductNames },
            transaction,
          )
        : [];
      const createdProductIdByName = new Map(
        createdProducts.map((product) => [product.productName, Number(product.id)]),
      );

      const detailLabels = ["Front", "Side", "Detail"];
      const productImages = productsToCreate.flatMap((product) => {
        const productId = createdProductIdByName.get(product.productName);
        if (!productId) return [];
        return detailLabels.map((label) => ({
          productId,
          imageUrl: createExampleImage(`${product.productName} ${label}`),
        }));
      });
      await bulkInsert(queryInterface, "ProductImages", productImages, transaction);

      const existingSkus = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT sku
          FROM ProductVariants
          WHERE sku IS NOT NULL
        `,
        {},
        transaction,
      );
      const skuSet = new Set(existingSkus.map((item) => item.sku));
      const variantMeta = [];
      const productVariants = [];

      productsToCreate.forEach((product, productIndex) => {
        const productId = createdProductIdByName.get(product.productName);
        if (!productId) return;

        buildVariants({
          type: product.type,
          categoryCode: product.categoryCode,
          productIndex,
          productName: product.productName,
        }).forEach((variant, variantIndex) => {
          if (skuSet.has(variant.sku)) return;
          skuSet.add(variant.sku);
          productVariants.push({
            productId,
            sku: variant.sku,
            price: variant.price,
            discount: variant.discount,
            color: variant.color,
            size: variant.size,
            material: variant.material,
            weight: variant.weight,
          });
          variantMeta.push({
            sku: variant.sku,
            productIndex,
            variantIndex,
            premium: getTierRatio(productIndex) >= 0.72,
          });
        });
      });

      await bulkInsert(queryInterface, "ProductVariants", productVariants, transaction);

      const createdVariants = variantMeta.length
        ? await selectAll(
            queryInterface,
            Sequelize,
            `
              SELECT id, sku
              FROM ProductVariants
              WHERE sku IN (:skus)
            `,
            { skus: variantMeta.map((variant) => variant.sku) },
            transaction,
          )
        : [];
      const variantIdBySku = new Map(
        createdVariants.map((variant) => [variant.sku, Number(variant.id)]),
      );

      const variantStocks = variantMeta.flatMap((meta) => {
        const variantId = variantIdBySku.get(meta.sku);
        if (!variantId) return [];
        return branches.map((branch, branchIndex) => ({
          variantId,
          branchId: Number(branch.id),
          stock: buildStock({
            branchIndex,
            productIndex: meta.productIndex,
            variantIndex: meta.variantIndex,
            premium: meta.premium,
          }),
        }));
      });

      await bulkInsert(queryInterface, "VariantStocks", variantStocks, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const seededVariants = await selectAll(
        queryInterface,
        Sequelize,
        `
          SELECT id, productId
          FROM ProductVariants
          WHERE sku LIKE :skuPrefix
        `,
        { skuPrefix: `${SKU_PREFIX}-%` },
        transaction,
      );
      const variantIds = seededVariants.map((variant) => Number(variant.id));
      const productIds = [...new Set(seededVariants.map((variant) => Number(variant.productId)))];

      if (variantIds.length) {
        await queryInterface.bulkDelete(
          "VariantStocks",
          { variantId: variantIds },
          { transaction },
        );
      }

      if (productIds.length) {
        await queryInterface.bulkDelete(
          "ProductImages",
          { productId: productIds },
          { transaction },
        );
      }

      if (variantIds.length) {
        await queryInterface.bulkDelete(
          "ProductVariants",
          { id: variantIds },
          { transaction },
        );
      }

      if (productIds.length) {
        await queryInterface.bulkDelete(
          "Products",
          { id: productIds },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
