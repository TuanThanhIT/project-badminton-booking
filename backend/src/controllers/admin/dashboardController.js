import { StatusCodes } from "http-status-codes";
import dashboardService from "../../services/admin/dashboardService.js";

/* ===================== 1. Số lượt đặt sân hôm nay ===================== */
const getTodayBookingCount = async (req, res, next) => {
  try {
    const data = await dashboardService.getTodayBookingCountService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

/* ===================== 2. Doanh thu 7 ngày gần nhất ===================== */
const getRevenueLast7Days = async (req, res, next) => {
  try {
    const data = await dashboardService.getRevenueLast7DaysService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

/* ===================== 3. Đơn bán lẻ hôm nay ===================== */
const getTodayRetailOrder = async (req, res, next) => {
  try {
    const data = await dashboardService.getTodayRetailOrderService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

/* ===================== 5. Top sản phẩm bán chạy ===================== */
const getTopProduct = async (req, res, next) => {
  try {
    const data = await dashboardService.getTopProductService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

/* ===================== 6. Top đồ uống bán chạy ===================== */
const getTopBeverage = async (req, res, next) => {
  try {
    const data = await dashboardService.getTopBeverageService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

/* ===================== 7. Cảnh báo tồn kho thấp ===================== */
const getLowStockWarning = async (req, res, next) => {
  try {
    const data = await dashboardService.getLowStockWarningService();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const dashboardController = {
  getTodayBookingCount,
  getRevenueLast7Days,
  getTodayRetailOrder,
  getTopProduct,
  getTopBeverage,
  getLowStockWarning,
};

export default dashboardController;
