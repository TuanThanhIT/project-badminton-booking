import type { District, Province, Ward } from "../../types/address";
import type { ApiResponse } from "../../types/api";
import instance from "../../utils/axiosCustomize";

const getProvincesService = async (): Promise<Province[]> => {
  const response =
    await instance.get<ApiResponse<Province[]>>("/user/locations/provinces");

  return response.data.data;
};

export const getDistrictsService = async (
  provinceId: number,
): Promise<District[]> => {
  const response = await instance.get<ApiResponse<District[]>>(
    "/user/locations/districts",
    {
      params: { provinceId },
    },
  );

  return response.data.data;
};

export const getWardsService = async (districtId: number): Promise<Ward[]> => {
  const response = await instance.get<ApiResponse<Ward[]>>(
    "/user/locations/wards",
    {
      params: { districtId },
    },
  );

  return response.data.data;
};

const locationService = {
  getProvincesService,
  getDistrictsService,
  getWardsService,
};

export default locationService;
