import { COLOR_MAP } from "./constants/color";

export const normalizeColor = (color: string) => {
  return color
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
};

export const getColorHex = (color: string) => {
  const key = normalizeColor(color);
  return COLOR_MAP[key] || "#ccc";
};

export const getColorParts = (color: string) =>
  String(color || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

export const getColorBackground = (color: string) => {
  const parts = getColorParts(color);

  if (parts.length <= 1) return getColorHex(color);

  const stops = parts.map((part, index) => {
    const start = (index / parts.length) * 100;
    const end = ((index + 1) / parts.length) * 100;
    const hex = getColorHex(part);
    return `${hex} ${start}% ${end}%`;
  });

  return `linear-gradient(135deg, ${stops.join(", ")})`;
};
