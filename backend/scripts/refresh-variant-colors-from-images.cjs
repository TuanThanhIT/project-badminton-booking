"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");
const reportPath = path.join(rootDir, "seeders", "reports", "variant-color-refresh-report.md");

const seedData = require(seedPath);

const productImages = new Map();
for (const image of seedData.productimages || []) {
  if (!productImages.has(image.productId)) productImages.set(image.productId, []);
  productImages.get(image.productId).push(image.imageUrl);
}

const products = seedData.products.map((product) => ({
  id: product.id,
  imageUrl: productImages.get(product.id)?.[0] || product.thumbnailUrl,
}));

const payloadPath = path.join(rootDir, "seeders", "reports", ".variant-color-input.json");
const outputPath = path.join(rootDir, "seeders", "reports", ".variant-color-output.json");
fs.mkdirSync(path.dirname(payloadPath), { recursive: true });
fs.writeFileSync(payloadPath, JSON.stringify(products), "utf8");

const pythonScript = String.raw`
import json
import sys
import colorsys
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from urllib.request import Request, urlopen

from PIL import Image

input_path, output_path = sys.argv[1], sys.argv[2]

def is_background(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    # ShopVNB product photos often have a white/very light gray background.
    return (r > 225 and g > 225 and b > 225) or (sat < 0.08 and 170 < mx < 245)

def classify_color(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    value = mx / 255
    hue, hsv_sat, hsv_value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)

    if value < 0.2:
        return "Đen", 1.1
    if sat < 0.12:
        return "Xám", 0.45
    if hue < 0.03 or hue >= 0.94:
        return "Đỏ", 1.25
    if hue < 0.09:
        return "Cam", 1.25
    if hue < 0.18:
        return "Vàng", 1.3
    if hue < 0.43:
        return "Xanh lá", 1.35
    if hue < 0.58:
        return "Xanh dương", 1.3
    if hue < 0.76:
        return "Tím", 1.15
    return "Hồng", 1.35

def color_sort_key(name):
    order = {
        "Đen": 0,
        "Trắng": 1,
        "Xám": 2,
        "Đỏ": 3,
        "Hồng": 4,
        "Cam": 5,
        "Vàng": 6,
        "Xanh lá": 7,
        "Xanh dương": 8,
        "Tím": 9,
        "Nâu": 10,
    }
    return order.get(name, 99)

def extract_colors(url):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=20) as res:
        image = Image.open(BytesIO(res.read())).convert("RGB")

    image.thumbnail((220, 220))
    buckets = {}
    total = 0

    for r, g, b in image.getdata():
        if is_background(r, g, b):
            continue
        name, weight = classify_color(r, g, b)
        weighted_count = weight
        buckets[name] = buckets.get(name, 0) + weighted_count
        total += weighted_count

    if total == 0:
        return ["Xám"]

    ranked = sorted(buckets.items(), key=lambda item: item[1], reverse=True)
    has_vivid_color = any(
        name not in ("Đen", "Trắng", "Xám", "Nâu") and count / total >= 0.1
        for name, count in ranked
    )
    selected = []
    for name, count in ranked:
        ratio = count / total
        if has_vivid_color and name == "Xám" and ratio < 0.28:
            continue
        if ratio >= 0.07 or (not selected and ratio >= 0.035):
            selected.append(name)
        if len(selected) >= 3:
            break

    if not selected:
        selected = [ranked[0][0]]
    return sorted(selected, key=color_sort_key)

with open(input_path, "r", encoding="utf-8") as file:
    products = json.load(file)

def process_product(product):
    try:
        colors = extract_colors(product["imageUrl"])
        return {"id": product["id"], "colors": colors, "imageUrl": product["imageUrl"]}
    except Exception as exc:
        return {"id": product["id"], "colors": [], "imageUrl": product["imageUrl"], "error": str(exc)}

results = []
with ThreadPoolExecutor(max_workers=16) as executor:
    futures = [executor.submit(process_product, product) for product in products]
    for future in as_completed(futures):
        results.append(future.result())

results.sort(key=lambda item: int(item["id"]))

with open(output_path, "w", encoding="utf-8") as file:
    json.dump(results, file, ensure_ascii=False, indent=2)
`;

const run = spawnSync("python", ["-c", pythonScript, payloadPath, outputPath], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  maxBuffer: 1024 * 1024 * 20,
});

if (run.status !== 0) {
  console.error(run.stdout);
  console.error(run.stderr);
  process.exit(run.status || 1);
}

const detected = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const colorsByProduct = new Map(detected.map((item) => [Number(item.id), item]));
let updatedVariants = 0;
let unchangedVariants = 0;
let failedProducts = 0;

for (const product of seedData.products || []) {
  const result = colorsByProduct.get(Number(product.id));
  if (!result?.colors?.length) {
    failedProducts += 1;
    continue;
  }
  const colorText = result.colors.join("/");
  for (const variant of seedData.productvariants || []) {
    if (Number(variant.productId) !== Number(product.id)) continue;
    if (variant.color !== colorText) {
      variant.color = colorText;
      updatedVariants += 1;
    } else {
      unchangedVariants += 1;
    }
  }
}

fs.writeFileSync(seedPath, `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`, "utf8");

const reportRows = detected.slice(0, 250).map((item) =>
  `| ${item.id} | ${(item.colors || []).join("/")} | ${item.error || ""} | ${item.imageUrl} |`,
);
fs.writeFileSync(
  reportPath,
  [
    "# Variant color refresh report",
    "",
    `- Products scanned: ${detected.length}`,
    `- Variants updated: ${updatedVariants}`,
    `- Variants unchanged: ${unchangedVariants}`,
    `- Products failed: ${failedProducts}`,
    "",
    "| Product ID | Detected colors | Error | Image |",
    "|---:|---|---|---|",
    ...reportRows,
    "",
  ].join("\n"),
  "utf8",
);

fs.rmSync(payloadPath, { force: true });
fs.rmSync(outputPath, { force: true });

console.log(`Products scanned: ${detected.length}`);
console.log(`Variants updated: ${updatedVariants}`);
console.log(`Products failed: ${failedProducts}`);
console.log(`Report: ${reportPath}`);
