import instance from "../../utils/axiosCustomize";
import type {
  GetAvailableCourtsRequest,
  GetMonthlyAvailableCourtsRequest,
  CourtAvailableResponse,
} from "../../types/court";
const getAllCourtsService = () => {
  return instance.get("/user/courts");
};

const getCourtsByIdsService = (ids: number[]) => {
  // Feed chỉ cần tên các sân xuất hiện trong danh sách bài đăng hiện tại,
  // nên gửi mảng id để backend lọc bằng IN (...) thay vì tải toàn bộ.
  const uniqueIds = Array.from(new Set(ids)).filter((id) => id > 0);
  return instance.get("/user/courts", {
    params: uniqueIds.length > 0 ? { ids: uniqueIds.join(",") } : undefined,
  });
};
const getAvailableCourtsService = (params: GetAvailableCourtsRequest) =>
  instance.get<CourtAvailableResponse>("/user/courts/available", {
    params,
  });
const getMonthlyAvailableCourtsService = (
  data: GetMonthlyAvailableCourtsRequest,
) =>
  instance.post<CourtAvailableResponse>(
    "/user/monthly-bookings/available-courts",
    data,
  );
const courtService = {
  getAllCourtsService,
  getCourtsByIdsService,
  getAvailableCourtsService,
  getMonthlyAvailableCourtsService,
};

export default courtService;
