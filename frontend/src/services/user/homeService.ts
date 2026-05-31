import type { HomeDataResponse } from "../../types/home";
import instance from "../../utils/axiosCustomize";

const getHomeDataService = () => instance.get<HomeDataResponse>("/user/home");

const homeService = {
  getHomeDataService,
};

export default homeService;
