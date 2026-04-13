import instance from "../../utils/axiosCustomize";

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

const courtService = {
  getAllCourtsService,
  getCourtsByIdsService,
};

export default courtService;
