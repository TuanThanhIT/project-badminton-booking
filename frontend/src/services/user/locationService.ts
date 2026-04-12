import type { District, Province, Ward } from "../../types/address";

/* PROVINCES */
const getProvincesService = async (): Promise<Province[]> => {
  const res = await fetch("https://provinces.open-api.vn/api/p/");

  if (!res.ok) throw new Error("Failed to fetch provinces");

  return res.json();
};

/* DISTRICTS */
const getDistrictsService = async (
  provinceCode: number,
): Promise<{ districts: District[] }> => {
  const res = await fetch(
    `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
  );

  if (!res.ok) throw new Error("Failed to fetch districts");

  return res.json();
};

/* WARDS */
const getWardsService = async (
  districtCode: number,
): Promise<{ wards: Ward[] }> => {
  const res = await fetch(
    `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
  );

  if (!res.ok) throw new Error("Failed to fetch wards");

  return res.json();
};

const locationService = {
  getProvincesService,
  getDistrictsService,
  getWardsService,
};

export default locationService;
