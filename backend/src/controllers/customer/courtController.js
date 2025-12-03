import courtService from "../../services/customer/courtService.js";

const getCourts = async (req, res, next) => {
  try {
    const { date, page, limit } = req.query;
    const courts = await courtService.getCourtsService(date, page, limit);
    return res.status(200).json(courts);
  } catch (error) {
    next(error);
  }
};

const getCourtSchedule = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { date } = req.query;
    const courtSchedule = await courtService.getCourtScheduleService(
      orderId,
      date
    );
    return res.status(200).json(courtSchedule);
  } catch (error) {
    next(error);
  }
};

const getCourtPrice = async (req, res, next) => {
  try {
    const courtPrices = await courtService.getCourtPriceService();
    return res.status(200).json(courtPrices);
  } catch (error) {
    next(error);
  }
};
const courtController = {
  getCourts,
  getCourtSchedule,
  getCourtPrice,
};
export default courtController;
