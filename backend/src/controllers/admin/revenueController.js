import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import revenueService from "../../services/admin/revenueService.js";

const getDashboardOverview = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await revenueService.getDashboardOverviewService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy dữ liệu tổng quan dashboard thành công", result),
    );
});

const getRevenueByDate = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await revenueService.getRevenueByDayService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy dữ liệu doanh thu theo ngày thành công", result),
    );
});

const getBookingOrderList = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await revenueService.getRevenueTransactionListService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy dữ liệu đặt sân và mua hàng thành công", result),
    );
});

const getRevenueProduct = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await revenueService.getRevenueProductService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy dữ liệu doanh thu sản phẩm thành công", result),
    );
});

const getRevenueBeverage = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await revenueService.getRevenueBeverageService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy dữ liệu doanh thu đồ uống thành công", result),
    );
});

const revenueController = {
  getDashboardOverview,
  getRevenueByDate,
  getBookingOrderList,
  getRevenueProduct,
  getRevenueBeverage,
};

export default revenueController;
