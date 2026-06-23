"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");
const linkPath = path.join(rootDir, "seeders", "data", "product-image-links.json");
const reportPath = path.join(rootDir, "seeders", "reports", "product-media-refresh-report.md");

const seedData = require(seedPath);
const linkData = require(linkPath);

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toUpperCase();

const unique = (items) => [...new Set(items.filter(Boolean))];

const hashString = (value) => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = (items, seedText) => {
  let seed = hashString(seedText) || 1;
  const result = [...items];
  const random = () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const getFileSlug = (url) => {
  const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/_\d+_[a-z0-9]+$/i, "")
    .replace(/_[a-z0-9]{6}$/i, "")
    .replace(/-(?:[1-9]|1\d)$/i, "");
};

const groupUrlsByProduct = (urls) => {
  const groups = new Map();
  for (const url of unique(urls)) {
    const slug = getFileSlug(url);
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug).push(url);
  }
  return [...groups.entries()].map(([slug, imageUrls]) => ({
    slug,
    imageUrls: unique(imageUrls),
  }));
};

const titleWords = {
  vot: "vợt",
  cau: "cầu",
  long: "lông",
  giay: "giày",
  vay: "váy",
  quan: "quần",
  tui: "túi",
  dung: "đựng",
  balo: "balo",
  vo: "vớ",
  can: "cán",
  ong: "ống",
  nhua: "nhựa",
  moc: "móc",
  khoc: "khóa",
  khoa: "khóa",
  hinh: "hình",
  san: "sân",
  de: "đế",
  lot: "lót",
  day: "dây",
  cuoc: "cước",
  cang: "căng",
  bong: "bóng",
  tap: "tập",
  co: "cổ",
  tay: "tay",
  binh: "bình",
  nuoc: "nước",
  giu: "giữ",
  nhiet: "nhiệt",
  bang: "băng",
  tran: "trán",
  khuyu: "khuỷu",
  got: "gót",
  chan: "chân",
  goi: "gối",
  den: "đen",
  trang: "trắng",
  xanh: "xanh",
  vang: "vàng",
  do: "đỏ",
  tim: "tím",
  xam: "xám",
  nam: "nam",
  nu: "nữ",
  vai: "vải",
  cuon: "cuộn",
  cai: "cái",
  nho: "nhỏ",
  chinh: "chính",
  hang: "hãng",
  mau: "màu",
};

const titleCase = (slug) =>
  slug
    .replace(/^quan-can-/, "quấn-cán-")
    .replace(/(^|-)hinh-hang(?=-|$)/g, "$1chinh-hang")
    .split("-")
    .filter(Boolean)
    .map((word) => titleWords[word.toLowerCase()] || word)
    .map((word) => {
      if (["vnb", "vs", "tm"].includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      if (/^[a-z]*\d+[a-z0-9]*$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/\bChính Hãng\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const detectBrand = (slug, fallback = "B-Hub") => {
  const brands = [
    ["alien-armour", "Alien Armour"],
    ["donex-pro", "Donex Pro"],
    ["donexpro", "Donex Pro"],
    ["flypower", "FlyPower"],
    ["sunbatta", "Sunbatta"],
    ["babolat", "Babolat"],
    ["promax", "Promax"],
    ["proace", "Proace"],
    ["apacs", "Apacs"],
    ["kumpoo", "Kumpoo"],
    ["kamito", "Kamito"],
    ["victec", "Victec"],
    ["adonex", "Adonex"],
    ["sfd", "SFD"],
    ["yonex", "Yonex"],
    ["victor", "Victor"],
    ["lining", "Li-Ning"],
    ["li-ning", "Li-Ning"],
    ["mizuno", "Mizuno"],
    ["kawasaki", "Kawasaki"],
    ["kumpoo", "Kumpoo"],
    ["taro", "Taro"],
    ["vnb", "VNB"],
    ["yasu", "Yasu"],
    ["kamito", "Kamito"],
    ["hyfa", "Hyfa"],
    ["kason", "Kason"],
    ["forza", "Forza"],
    ["vs", "VS"],
  ];
  const normalizedSlug = `-${slug.toLowerCase()}-`;
  return brands.find(([token]) => normalizedSlug.includes(`-${token}-`))?.[1] || fallback;
};

const detectCategoryBrand = (categoryName, fallback) => {
  const slug = normalize(categoryName).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return detectBrand(slug, fallback);
};

const accessoryCategoryBySlug = (slug) => {
  if (slug.startsWith("vo-cau-long-")) return "VO CAU LONG";
  if (slug.startsWith("quan-can-")) return "QUAN CAN CAU LONG";
  if (slug.startsWith("ong-cau-long-")) return "QUA CAU LONG";
  if (slug.startsWith("moc-")) return "MOC KHOA CAU LONG";
  if (slug.startsWith("de-lot-")) return "LOT GIAY CAU LONG";
  if (slug.startsWith("day-cuoc-")) return "CUOC DAN VOT CAU LONG";
  if (slug.startsWith("bong-tap-")) return "BANH POWER BALL";
  if (slug.startsWith("binh-nuoc-")) return "BINH NUOC CAU LONG";
  if (slug.startsWith("bang-tran-") || slug.startsWith("bang-co-tay-")) {
    return "BANG CHAN MO HOI";
  }
  if (slug.startsWith("bang-")) return "BANG BO CO";
  return null;
};

const productTypeLabels = {
  "VOT CAU LONG": "Vợt cầu lông",
  "GIAY CAU LONG": "Giày cầu lông",
  "AO CAU LONG": "Áo cầu lông",
  "VAY CAU LONG": "Váy cầu lông",
  "QUAN CAU LONG": "Quần cầu lông",
  "TUI VOT CAU LONG": "Túi vợt cầu lông",
  "BALO CAU LONG": "Balo cầu lông",
};

const seriesByGroup = {
  "VOT CAU LONG": [
    "Aero Strike",
    "Power Control",
    "Speed Drive",
    "Precision Tour",
    "Champion Elite",
  ],
  "GIAY CAU LONG": [
    "Court Motion",
    "Aero Cushion",
    "Speed Flex",
    "Power Step",
    "Indoor Pro",
  ],
  "AO CAU LONG": [
    "Tournament Fit",
    "Aero Comfort",
    "Dynamic Court",
    "Elite Match",
    "Team Spirit",
  ],
  "VAY CAU LONG": [
    "Court Pleats",
    "Aero Flex",
    "Match Motion",
    "Active Skirt",
    "Tournament Fit",
  ],
  "QUAN CAU LONG": [
    "Court Flex",
    "Aero Move",
    "Match Training",
    "Active Motion",
    "Tournament Pro",
  ],
  "TUI VOT CAU LONG": [
    "Tournament Series",
    "Pro Carry",
    "Team Collection",
    "Court Travel",
    "Multi Compartment",
  ],
  "BALO CAU LONG": [
    "Court Backpack",
    "Tournament Pack",
    "Team Travel",
    "Pro Storage",
    "Active Carry",
  ],
};

const catalogVariants = [
  "Pro Performance 2026",
  "Elite Competition",
  "Tour Edition",
  "Club Series",
  "Aero Dynamic",
  "Power Motion",
  "Speed Control",
  "Active Comfort",
  "Precision Fit",
  "Court Master",
  "Champion Series",
  "Premium Training",
  "Indoor Performance",
  "Team Collection",
  "Limited Court Edition",
];

const featureCopyByGroup = {
  "VOT CAU LONG":
    "khả năng kiểm soát cầu ổn định, thân vợt cân bằng và cảm giác vung linh hoạt",
  "GIAY CAU LONG":
    "độ bám sân tốt, đệm chân êm và khả năng hỗ trợ đổi hướng linh hoạt",
  "AO CAU LONG":
    "chất liệu nhẹ thoáng, form thể thao gọn gàng và cảm giác dễ chịu khi vận động",
  "VAY CAU LONG":
    "phom dáng thể thao nữ tính, độ co giãn tốt và sự thoải mái khi di chuyển",
  "QUAN CAU LONG":
    "phom vận động linh hoạt, chất liệu thoáng nhẹ và khả năng phối đồ dễ dàng",
  "TUI VOT CAU LONG":
    "không gian chứa đồ hợp lý, quai mang chắc chắn và khả năng bảo vệ dụng cụ",
  "BALO CAU LONG":
    "nhiều ngăn tiện dụng, thiết kế đeo êm vai và khả năng sắp xếp đồ tập gọn gàng",
  "PHU KIEN CAU LONG":
    "thiết kế tiện dụng, độ bền ổn định và khả năng hỗ trợ tốt cho việc tập luyện",
};

const experienceCopyByGroup = {
  "VOT CAU LONG":
    "Cấu trúc được định hướng theo sự cân bằng giữa tốc độ vung, độ ổn định và khả năng điều cầu. Người chơi có thể sử dụng trong các bài tập kỹ thuật, đánh đôi tốc độ hoặc những trận giao lưu cần khả năng phản tạt và xử lý cầu linh hoạt.",
  "GIAY CAU LONG":
    "Thiết kế ưu tiên cảm giác chắc chân khi di chuyển ngang, lên lưới và lùi cuối sân. Phần thân giày ôm vừa phải, đế ngoài hỗ trợ bám mặt sân trong nhà và lớp đệm giúp giảm cảm giác nặng chân khi vận động liên tục.",
  "AO CAU LONG":
    "Phom áo được xây dựng cho biên độ vận động lớn ở vai và cánh tay. Bề mặt vải nhẹ, dễ thoát ẩm và phù hợp với cường độ tập luyện thường xuyên, từ các buổi đánh phong trào đến thi đấu nội bộ câu lạc bộ.",
  "VAY CAU LONG":
    "Thiết kế kết hợp vẻ ngoài gọn gàng với khả năng chuyển động linh hoạt. Phom váy phù hợp cho các bước chạy ngắn, đổi hướng và bật nhảy, đồng thời dễ phối cùng áo thi đấu hoặc áo tập hằng ngày.",
  "QUAN CAU LONG":
    "Phom quần thể thao tạo khoảng vận động thoải mái ở hông và đùi, phù hợp cho những động tác chùng gối, cứu cầu và di chuyển đa hướng. Chất liệu nhẹ giúp người mặc duy trì cảm giác thoáng trong suốt buổi chơi.",
  "TUI VOT CAU LONG":
    "Bố cục ngăn chứa hướng đến việc sắp xếp vợt, cầu, khăn, quần áo và phụ kiện một cách khoa học. Quai mang được thiết kế để sử dụng thuận tiện khi di chuyển từ nhà đến sân hoặc trong các buổi giao lưu xa.",
  "BALO CAU LONG":
    "Không gian lưu trữ được phân chia hợp lý cho dụng cụ tập luyện và vật dụng cá nhân. Kiểu dáng gọn, dễ mang hằng ngày và phù hợp cho người chơi cần di chuyển bằng xe máy, phương tiện công cộng hoặc đi bộ.",
  "PHU KIEN CAU LONG":
    "Sản phẩm tập trung vào tính tiện dụng trong quá trình chuẩn bị, tập luyện và phục hồi. Kích thước gọn, cách dùng đơn giản và phù hợp để bổ sung vào túi đồ của cả người mới chơi lẫn người luyện tập thường xuyên.",
};

const careCopyByGroup = {
  "VOT CAU LONG":
    "Tránh va chạm khung vợt với nền sân, không để vợt trong môi trường nhiệt độ cao và nên kiểm tra dây cước, gen vợt định kỳ.",
  "GIAY CAU LONG":
    "Chỉ nên sử dụng trên mặt sân phù hợp, làm sạch đế sau khi chơi và để giày khô tự nhiên ở nơi thoáng khí.",
  "AO CAU LONG":
    "Giặt nhẹ với sản phẩm cùng màu, hạn chế chất tẩy mạnh và phơi ở nơi thoáng mát để giữ phom cùng màu vải.",
  "VAY CAU LONG":
    "Nên giặt nhẹ, tránh nhiệt độ cao và bảo quản khô thoáng để duy trì độ co giãn cùng cấu trúc sản phẩm.",
  "QUAN CAU LONG":
    "Giặt sau khi vận động, không ngâm lâu và hạn chế sấy nhiệt cao để chất liệu giữ được độ mềm nhẹ.",
  "TUI VOT CAU LONG":
    "Lau sạch bề mặt sau khi sử dụng, không để đồ ẩm lâu trong túi và bảo quản tại nơi khô thoáng.",
  "BALO CAU LONG":
    "Sắp xếp tải trọng cân đối, vệ sinh bằng khăn mềm và mở ngăn balo sau buổi tập để hạn chế tích tụ độ ẩm.",
  "PHU KIEN CAU LONG":
    "Vệ sinh theo đặc tính vật liệu, giữ sản phẩm khô ráo và kiểm tra tình trạng trước mỗi buổi tập.",
};

const buildDescription = ({ name, categoryName, groupKey, brand }) => {
  const feature =
    featureCopyByGroup[groupKey] || featureCopyByGroup["PHU KIEN CAU LONG"];
  const experience =
    experienceCopyByGroup[groupKey] || experienceCopyByGroup["PHU KIEN CAU LONG"];
  const care = careCopyByGroup[groupKey] || careCopyByGroup["PHU KIEN CAU LONG"];
  return `<div class="space-y-5 text-gray-700 leading-relaxed">
  <div class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
    <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-600">${categoryName} · ${brand}</p>
    <h3 class="text-2xl font-bold text-slate-900">${name}</h3>
    <p class="mt-3"><strong>${name}</strong> là lựa chọn được B-Hub tuyển chọn cho người chơi yêu cầu cao về sự chỉn chu, tính thực dụng và trải nghiệm ổn định trong quá trình tập luyện. Sản phẩm thuộc danh mục <strong>${categoryName}</strong>, phù hợp để hoàn thiện bộ trang bị cá nhân hoặc làm mới dụng cụ cho mùa giải và các buổi giao lưu sắp tới.</p>
  </div>

  <section>
    <h4 class="mb-2 text-lg font-bold text-sky-700">Thiết kế hướng đến người chơi cầu lông</h4>
    <p>Sản phẩm mang tinh thần thể thao đặc trưng của <strong>${brand}</strong>, nổi bật với ${feature}. Tổng thể được định hướng theo phong cách hiện đại, dễ sử dụng và có tính ứng dụng cao trong nhiều điều kiện tập luyện khác nhau.</p>
    <p class="mt-2">${experience}</p>
  </section>

  <div class="grid gap-4 md:grid-cols-2">
    <section class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      <h4 class="mb-2 font-bold text-emerald-700">Điểm nổi bật</h4>
      <ul class="list-disc space-y-1.5 pl-5">
        <li>Thiết kế thể thao hiện đại, dễ kết hợp với bộ trang bị đang sử dụng.</li>
        <li>Ưu tiên cảm giác thoải mái, ổn định và thuận tiện trong quá trình vận động.</li>
        <li>Phù hợp cho luyện tập hằng ngày, giao lưu câu lạc bộ và thi đấu phong trào.</li>
        <li>Hình ảnh sản phẩm được sắp xếp theo đúng từng mẫu để dễ theo dõi chi tiết.</li>
      </ul>
    </section>

    <section class="rounded-xl border border-amber-100 bg-amber-50 p-4">
      <h4 class="mb-2 font-bold text-amber-700">Đối tượng phù hợp</h4>
      <ul class="list-disc space-y-1.5 pl-5">
        <li>Người mới chơi muốn lựa chọn sản phẩm dễ làm quen và sử dụng lâu dài.</li>
        <li>Người chơi phong trào luyện tập đều đặn tại sân hoặc câu lạc bộ.</li>
        <li>Học sinh, sinh viên và nhân viên văn phòng yêu thích vận động.</li>
        <li>Đội nhóm cần trang bị đồng bộ cho các buổi tập và giải đấu nội bộ.</li>
      </ul>
    </section>
  </div>

  <section>
    <h4 class="mb-2 text-lg font-bold text-sky-700">Gợi ý sử dụng và bảo quản</h4>
    <p>${care} Việc bảo quản đúng cách giúp sản phẩm duy trì tính thẩm mỹ, độ bền và trải nghiệm sử dụng ổn định trong thời gian dài.</p>
  </section>

  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h4 class="mb-2 font-bold text-slate-800">Trải nghiệm mua sắm tại B-Hub</h4>
    <p>Khi lựa chọn <strong>${name}</strong>, khách hàng có thể kết hợp cùng dịch vụ đặt sân, mua phụ kiện và chuẩn bị đồ uống ngay trong hệ sinh thái B-Hub. Thông tin sản phẩm, hình ảnh và danh mục được đồng bộ để việc tìm kiếm, so sánh và lựa chọn trở nên thuận tiện hơn.</p>
  </section>

  <p><strong>${name}</strong> phù hợp cho những ai đang tìm một sản phẩm cầu lông có diện mạo chuyên nghiệp, công năng rõ ràng và khả năng đồng hành tốt trong các buổi tập luyện thường xuyên.</p>
</div>`;
};

const categoriesById = new Map(seedData.categories.map((category) => [category.id, category]));
const imagesByProductId = new Map();
for (const image of seedData.productimages) {
  if (!imagesByProductId.has(image.productId)) imagesByProductId.set(image.productId, []);
  imagesByProductId.get(image.productId).push(image.imageUrl);
}

const docGroups = new Map(
  Object.entries(linkData.groups).map(([groupName, urls]) => [
    normalize(groupName),
    groupUrlsByProduct(urls),
  ]),
);

const oldShirtGroupCandidates = seedData.products
  .filter((product) => {
    const category = categoriesById.get(product.categoryId);
    const isShirt = normalize(category?.menuGroup) === "AO CAU LONG";
    const looksLikeShirt =
      normalize(product.productName).startsWith("AO CAU LONG") ||
      /ao-cau-long|products\/(?:thumbnails|images)\//i.test(product.thumbnailUrl);
    return isShirt && looksLikeShirt && !product.thumbnailUrl.includes("placehold.co");
  })
  .map((product) => ({
    slug: `ao-cu-${product.id}`,
    imageUrls: unique([
      product.thumbnailUrl,
      ...(imagesByProductId.get(product.id) || []).filter(
        (url) => !url.includes("placehold.co"),
      ),
    ]),
  }))
  .filter((group) => group.imageUrls.length > 0);

const oldShirtGroups = [
  ...new Map(
    oldShirtGroupCandidates.map((group) => {
      const imageUrls = [...group.imageUrls].sort();
      const signature = imageUrls.join("|");
      return [
        signature,
        {
          slug: `ao-cu-${hashString(signature)}`,
          imageUrls,
        },
      ];
    }),
  ).entries(),
]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, group]) => group);

docGroups.set("AO CAU LONG", oldShirtGroups);

const accessoryGroups = new Map();
for (const group of docGroups.get("PHU KIEN CAU LONG") || []) {
  const categoryKey = accessoryCategoryBySlug(group.slug);
  if (!categoryKey) continue;
  if (!accessoryGroups.has(categoryKey)) accessoryGroups.set(categoryKey, []);
  accessoryGroups.get(categoryKey).push(group);
}

const assignedImages = new Map();
const usedNames = new Set();
const reportRows = [];

const makeUniqueName = (baseName, productId) => {
  let name = baseName.slice(0, 245).trim();
  if (!usedNames.has(normalize(name))) {
    usedNames.add(normalize(name));
    return name;
  }
  const collections = [
    "Signature",
    "Performance",
    "Tournament",
    "Champion",
    "Premium",
  ];
  const styles = ["Series", "Collection", "Edition", "Select", "Line"];

  for (let offset = 0; offset < collections.length * styles.length; offset += 1) {
    const collection = collections[(productId + offset) % collections.length];
    const style = styles[(Math.floor(productId / collections.length) + offset) % styles.length];
    name = `${baseName.slice(0, 215)} ${collection} ${style}`;
    if (!usedNames.has(normalize(name))) {
      usedNames.add(normalize(name));
      return name;
    }
  }

  throw new Error(`Không thể tạo tên sản phẩm duy nhất cho: ${baseName}`);
};

const productsByBucket = new Map();
for (const product of seedData.products) {
  const category = categoriesById.get(product.categoryId);
  const groupKey = normalize(category?.menuGroup);
  const bucketKey =
    groupKey === "PHU KIEN CAU LONG" ? normalize(category?.cateName) : groupKey;
  if (!productsByBucket.has(bucketKey)) productsByBucket.set(bucketKey, []);
  productsByBucket.get(bucketKey).push(product);
}

for (const [bucketKey, products] of productsByBucket.entries()) {
  const firstCategory = categoriesById.get(products[0]?.categoryId);
  const groupKey = normalize(firstCategory?.menuGroup);
  const sourcePool =
    groupKey === "PHU KIEN CAU LONG"
      ? accessoryGroups.get(bucketKey) || []
      : docGroups.get(groupKey) || [];

  if (sourcePool.length === 0) {
    throw new Error(`Không có nhóm ảnh cho ${bucketKey}`);
  }

  const pool = seededShuffle(sourcePool, `media:${bucketKey}`);
  const orderedProducts = [...products].sort((left, right) => left.id - right.id);

  orderedProducts.forEach((product, index) => {
    const category = categoriesById.get(product.categoryId);
    const imageGroup = pool[index % pool.length];
    const variant = catalogVariants[index % catalogVariants.length];
    let brand = product.brand || "B-Hub";
    let baseName;

    if (groupKey === "PHU KIEN CAU LONG") {
      brand = detectBrand(imageGroup.slug, brand);
      const sourceName = titleCase(imageGroup.slug);
      baseName = `${sourceName} ${variant}`;
    } else {
      const typeLabel = productTypeLabels[groupKey] || category.menuGroup;
      const series = seriesByGroup[groupKey]?.[index % seriesByGroup[groupKey].length] || "Sport";
      brand = detectCategoryBrand(category.cateName, brand);
      baseName = `${typeLabel} ${brand} ${series} ${variant}`;
    }

    const productName = makeUniqueName(baseName, product.id);
    product.productName = productName;
    product.brand = brand;
    product.thumbnailUrl = imageGroup.imageUrls[0];
    product.description = buildDescription({
      name: productName,
      categoryName: category.cateName,
      groupKey,
      brand,
    });
    assignedImages.set(product.id, imageGroup.imageUrls);

    reportRows.push({
      productId: product.id,
      group: category.menuGroup,
      category: category.cateName,
      productName,
      imageCount: imageGroup.imageUrls.length,
      sourceSlug: imageGroup.slug,
    });
  });
}

let nextImageId = 1;
seedData.productimages = seedData.products.flatMap((product) => {
  const urls = assignedImages.get(product.id);
  if (!urls?.length) {
    throw new Error(`Sản phẩm ${product.id} chưa được gán ảnh.`);
  }
  return urls.map((imageUrl) => ({
    id: nextImageId++,
    imageUrl,
    productId: product.id,
  }));
});

const duplicateNames = seedData.products
  .map((product) => normalize(product.productName))
  .filter((name, index, all) => all.indexOf(name) !== index);
if (duplicateNames.length) {
  throw new Error(`Còn ${duplicateNames.length} tên sản phẩm trùng.`);
}

const placeholderCount = JSON.stringify({
  products: seedData.products,
  productimages: seedData.productimages,
}).match(/https:\/\/placehold\.co\//g)?.length || 0;
if (placeholderCount > 0) {
  throw new Error(`Còn ${placeholderCount} URL placeholder trong dữ liệu sản phẩm.`);
}

const output = `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`;
fs.writeFileSync(seedPath, output, "utf8");

const reportLines = [
  "# Báo cáo làm mới ảnh sản phẩm",
  "",
  `- Sản phẩm: ${seedData.products.length}`,
  `- Ảnh gallery: ${seedData.productimages.length}`,
  `- Bộ ảnh áo cũ được tái sử dụng: ${oldShirtGroups.length}`,
  `- Placeholder còn lại trong Products/ProductImages: ${placeholderCount}`,
  "",
  "## Pool ảnh",
  "",
  ...[...docGroups.entries()].map(([key, groups]) => `- ${key}: ${groups.length} bộ ảnh`),
  ...[...accessoryGroups.entries()].map(
    ([key, groups]) => `- PHỤ KIỆN / ${key}: ${groups.length} bộ ảnh`,
  ),
  "",
  "## Phân bổ",
  "",
  "| ID | Nhóm | Danh mục | Tên sản phẩm | Số ảnh | Slug nguồn |",
  "|---:|---|---|---|---:|---|",
  ...reportRows.map(
    (row) =>
      `| ${row.productId} | ${row.group} | ${row.category} | ${row.productName} | ${row.imageCount} | ${row.sourceSlug} |`,
  ),
  "",
];
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportLines.join("\n"), "utf8");

console.log(`Đã cập nhật ${seedData.products.length} sản phẩm.`);
console.log(`Đã tạo lại ${seedData.productimages.length} ảnh gallery.`);
console.log(`Đã ghi báo cáo: ${reportPath}`);
