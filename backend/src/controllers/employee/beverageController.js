import beverageService from "../../services/employee/beverageService.js";

const getBeverages = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const beverages = await beverageService.getBeveragesService(keyword);
    return res.status(200).json(beverages);
  } catch (error) {
    next(error);
  }
};
const beverageController = {
  getBeverages,
};
export default beverageController;
