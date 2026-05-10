import { COLOR_MAP } from "./constants/color";

export const normalizeColor = (color: string) => {
  return color
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const getColorHex = (color: string) => {
  const key = normalizeColor(color);
  return COLOR_MAP[key] || "#ccc";
};
