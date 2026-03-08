import { StatusCodes } from "http-status-codes";
import dashboardService from "../../services/admin/dashboardService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

/* ===================== 1. Số lượt đặt sân hôm nay ===================== */
const getTodayBookingCount = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTodayBookingCountService();
  res
    .status(200)
    .json(new SuccessResponse("Lấy số lượt đặt sân hôm nay thành công", data));
});

/* ===================== 2. Doanh thu 7 ngày gần nhất ===================== */
const getRevenueLast7Days = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueLast7DaysService();
  res
    .status(200)
    .json(
      new SuccessResponse("Lấy doanh thu 7 ngày gần nhất thành công", data),
    );
});

/* ===================== 3. Đơn bán lẻ hôm nay ===================== */
const getTodayRetailOrder = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTodayRetailOrderService();
  res
    .status(200)
    .json(new SuccessResponse("Lấy đơn lẻ hôm nay thành công", data));
});

/* ===================== 4. Top sản phẩm bán chạy ===================== */
const getTopProduct = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopProductService();
  res
    .status(200)
    .json(new SuccessResponse("Lấy top sản phẩm bán chạy thành công", data));
});

/* ===================== 5. Top đồ uống bán chạy ===================== */
const getTopBeverage = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopBeverageService();
  res
    .status(200)
    .json(new SuccessResponse("Lấy top đồ uống bán chạy thành công", data));
});

/* ===================== 6. Cảnh báo tồn kho thấp ===================== */
const getLowStockWarning = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLowStockWarningService();
  res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy thông tin cảnh báo tồn kho thấp thành công",
        data,
      ),
    );
});

/* ===================== 7. Lấy thông tin ca làm hôm nay ===================== */
const getTodayWorkShift = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTodayWorkShiftService();
  res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin ca làm thành công", data));
});

const dashboardController = {
  getTodayBookingCount,
  getRevenueLast7Days,
  getTodayRetailOrder,
  getTopProduct,
  getTopBeverage,
  getLowStockWarning,
  getTodayWorkShift,
};

export default dashboardController;
