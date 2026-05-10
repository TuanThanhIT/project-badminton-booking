import type { District, Province, Ward } from "../../types/address";

const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN_DEV;

const getProvincesService = async (): Promise<Province[]> => {
  const res = await fetch(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
    {
      method: "GET",
      headers: {
        Token: GHN_TOKEN,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch provinces");
  const data = await res.json();
  return data.data;
};

export const getDistrictsService = async (
  provinceId: number,
): Promise<District[]> => {
  const res = await fetch(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
    {
      method: "POST",
      headers: {
        Token: GHN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        province_id: provinceId,
      }),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch districts");
  const data = await res.json();
  return data.data;
};

export const getWardsService = async (districtId: number): Promise<Ward[]> => {
  const res = await fetch(
    `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
    {
      headers: {
        Token: GHN_TOKEN,
      },
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch wards");
  }
  const json = await res.json();
  return json.data;
};

const locationService = {
  getProvincesService,
  getDistrictsService,
  getWardsService,
};

export default locationService;
