import instance from "../../utils/axiosCustomize";
import type {
  CourtAvailableResponse,
  GetAvailableCourtsRequest,
} from "../../types/court";

const getAvailableCourtsService = (params: GetAvailableCourtsRequest) =>
  instance.get<CourtAvailableResponse>("/courts/available", {
    params,
  });

const courtService = {
  getAvailableCourtsService,
};

export default courtService;
