import revenueService from "../../services/admin/revenueService.js";

const getDashboardOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await revenueService.getDashboardOverviewService(
      startDate,
      endDate
    );

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getRevenueByDate = async (req, res, next) => {
  try {
    const { date } = req.query;

    const data = await revenueService.getRevenueByDayService(date);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getBookingOrderList = async (req, res, next) => {
  try {
    const { startDate, endDate, page, limit } = req.query;

    const data = await revenueService.getRevenueTransactionListService(
      startDate,
      endDate,
      page,
      limit
    );

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getRevenueProduct = async (req, res, next) => {
  try {
    const { startDate, endDate, page, limit } = req.query;

    const data = await revenueService.getRevenueProductService(
      startDate,
      endDate,
      page,
      limit
    );

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getRevenueBeverage = async (req, res, next) => {
  try {
    const { startDate, endDate, page, limit } = req.query;

    const data = await revenueService.getRevenueBeverageService(
      startDate,
      endDate,
      page,
      limit
    );

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const revenueController = {
  getDashboardOverview,
  getRevenueByDate,
  getBookingOrderList,
  getRevenueProduct,
  getRevenueBeverage,
};

export default revenueController;
