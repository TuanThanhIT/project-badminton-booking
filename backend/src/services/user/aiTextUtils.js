/** Chuẩn hóa text tiếng Việt cho keyword/BM25 retrieval. */
export const stripDiacritics = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

export const normalizeText = (text = "") =>
  stripDiacritics(text).toLowerCase().replace(/\s+/g, " ").trim();

export const tokenize = (text = "") => {
  const normalized = normalizeText(text).replace(/[^\w\s]/g, " ");
  return normalized.split(/\s+/).filter((token) => token.length >= 2);
};
