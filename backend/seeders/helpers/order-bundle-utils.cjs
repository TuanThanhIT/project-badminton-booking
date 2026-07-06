"use strict";

/**
 * Combo mua kèm thực tế — mỗi đơn ≥2 loại sản phẩm (không 2–3 đôi giày / 2 vợt).
 */
const ORDER_BUNDLES = [
  { categories: [1, 69], quantities: [1, 2], label: "racket-socks" },
  { categories: [1, 69, 70], quantities: [1, 2, 1], label: "racket-socks-string" },
  { categories: [1, 59], quantities: [1, 1], label: "racket-bag" },
  { categories: [1, 76], quantities: [1, 2], label: "racket-grip" },
  { categories: [11, 69], quantities: [1, 2], label: "shoes-socks" },
  { categories: [11, 59], quantities: [1, 1], label: "shoes-bag" },
  { categories: [11, 69, 59], quantities: [1, 2, 1], label: "shoes-socks-bag" },
  { categories: [1, 71], quantities: [1, 1], label: "racket-shuttle" },
];

const pickVariantForCategory = (pool, categoryId, usedProductIds, salt = 0) => {
  const candidates = pool.filter(
    (v) =>
      Number(v.categoryId) === Number(categoryId) &&
      !usedProductIds.has(Number(v.productId)),
  );
  if (!candidates.length) return null;
  return candidates[salt % candidates.length];
};

/**
 * @param {Array} pool variants có branchId, categoryId, productId
 * @param {number} orderIndex
 * @returns {Array<{ variant, quantity }>}
 */
const buildBundleLinesForOrder = (pool, orderIndex = 0) => {
  if (!pool?.length) return [];

  for (let offset = 0; offset < ORDER_BUNDLES.length; offset += 1) {
    const bundle = ORDER_BUNDLES[(orderIndex + offset) % ORDER_BUNDLES.length];
    const usedProductIds = new Set();
    const lines = [];

    for (let i = 0; i < bundle.categories.length; i += 1) {
      const variant = pickVariantForCategory(
        pool,
        bundle.categories[i],
        usedProductIds,
        orderIndex + i,
      );
      if (!variant) {
        lines.length = 0;
        break;
      }
      usedProductIds.add(Number(variant.productId));
      lines.push({
        variant,
        quantity: bundle.quantities[i] || 1,
      });
    }

    if (lines.length >= 2) return lines;
  }

  return [];
};

module.exports = {
  ORDER_BUNDLES,
  buildBundleLinesForOrder,
};
