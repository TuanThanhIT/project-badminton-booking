import type {
  CourtListRequest,
  CourtListResponse,
  CourtPriceResponse,
  CourtScheduleRequest,
  CourtScheduleResponse,
} from "../types/court";
import instance from "../utils/axiosCustomize";

const getCourtsService = async (data: CourtListRequest) => {
  const { date, page, limit } = data;

  return instance.get<CourtListResponse>("/user/court/list", {
    params: {
      date,
      page,
      limit,
    },
  });
};

const getCourtScheduleService = async (data: CourtScheduleRequest) => {
  const { courtId, date } = data;
  return instance.get<CourtScheduleResponse>(
    `/user/court/schedule/${courtId}`,
    {
      params: {
        date,
      },
    }
  );
};

const getCourtPriceService = async () =>
  instance.get<CourtPriceResponse>("/user/court/price");

const courtService = {
  getCourtsService,
  getCourtScheduleService,
  getCourtPriceService,
};
export default courtService;
