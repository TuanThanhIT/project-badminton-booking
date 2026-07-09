/** Chuẩn hóa text tiếng Việt cho keyword/BM25 retrieval. */
export const stripDiacritics = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

export const normalizeText = (text = "") =>
  stripDiacritics(text).toLowerCase().replace(/\s+/g, " ").trim();

/** Gom lỗi gõ phổ biến khi nhập giá (vd: triieeuj → trieu). */
export const relaxPriceTypos = (text = "") =>
  normalizeText(text)
    .replace(/\btri{2,}e{1,}u+j*\b/g, "trieu")
    .replace(/\btri+e+u+j*\b/g, "trieu")
    .replace(/(\d+(?:[.,]\d+)?)\s*tr(?:ie+[uj]+)/g, "$1 trieu");

/** Gom lỗi gõ sản phẩm (vd: vuot → vot). */
export const relaxProductTypos = (text = "") =>
  relaxPriceTypos(text).replace(/\bvuot\b/g, "vot");

export const tokenize = (text = "") => {
  const normalized = normalizeText(text).replace(/[^\w\s]/g, " ");
  return normalized.split(/\s+/).filter((token) => token.length >= 2);
};

/** Parse "2 triệu", "500k", "1500000" → VND. */
export const parseVietnamesePrice = (rawValue) => {
  const value = String(rawValue || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const millionMatch = value.match(/^(\d+(?:[.,]\d+)?)(?:tr|trieu|m|million)$/i);
  if (millionMatch) {
    return Math.round(Number(millionMatch[1].replace(",", ".")) * 1000000);
  }

  const thousandMatch = value.match(/^(\d+(?:[.,]\d+)?)(?:k|nghin)$/i);
  if (thousandMatch) {
    return Math.round(Number(thousandMatch[1].replace(",", ".")) * 1000);
  }

  const digits = value.replace(/[^\d]/g, "");
  const number = Number(digits);
  return Number.isFinite(number) && number > 0 ? number : null;
};

/** Trích min/max giá từ câu hỏi tiếng Việt (vd: "trên 2 triệu", "dưới 1.5 triệu"). */
export const extractPriceConstraints = (text) => {
  const normalized = relaxPriceTypos(text);
  const constraints = { minPrice: null, maxPrice: null };
  if (!normalized) return constraints;

  const priceToken = "(\\d[\\d.,]*(?:\\s*(?:tr|trieu|m|million|k|nghin))?)";
  const maxPatterns = [
    new RegExp(`(?:gia\\s*)?(?:duoi|nho hon|be hon|khong qua|toi da|<=|<)\\s*${priceToken}`, "i"),
    new RegExp(`${priceToken}\\s*(?:tro xuong|do lai)`, "i"),
  ];
  const minPatterns = [
    new RegExp(`(?:gia\\s*)?(?:tren|lon hon|cao hon|tren muc|>=|>)\\s*${priceToken}`, "i"),
    new RegExp(`${priceToken}\\s*(?:tro len)`, "i"),
  ];
  const rangeMatch = normalized.match(
    new RegExp(
      `(?:tu|trong khoang)\\s+${priceToken}\\s*(?:den|toi)\\s+${priceToken}`,
      "i",
    ),
  );

  if (rangeMatch) {
    constraints.minPrice = parseVietnamesePrice(rangeMatch[1]);
    constraints.maxPrice = parseVietnamesePrice(rangeMatch[2]);
  } else {
    for (const pattern of maxPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        constraints.maxPrice = parseVietnamesePrice(match[1]);
        break;
      }
    }
    for (const pattern of minPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        constraints.minPrice = parseVietnamesePrice(match[1]);
        break;
      }
    }

    // "giá 2 triệu", "vợt 2 triệu" (không nói trên/dưới) → ngân sách quanh mức đó
    if (!constraints.minPrice && !constraints.maxPrice) {
      const budgetMatch = normalized.match(
        /(?:gia\s+|khoang\s+)?(\d+(?:[.,]\d+)?\s*(?:tr|trieu|m|million))\b/,
      );
      if (budgetMatch) {
        const target = parseVietnamesePrice(budgetMatch[1]);
        if (target) {
          constraints.minPrice = Math.round(target * 0.85);
          constraints.maxPrice = Math.round(target * 1.15);
        }
      }
    }
  }

  return constraints;
};
