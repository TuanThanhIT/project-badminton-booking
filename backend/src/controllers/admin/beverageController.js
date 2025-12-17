import beverageService from "../../services/admin/beverageService.js";
<<<<<<< HEAD
import uploadBuffer from "../../utils/cloudinary.js";
=======
import uploadFile from "../../utils/upload.js";
import { StatusCodes } from "http-status-codes";
>>>>>>> dev_admin_thaitoan

const addBeverage = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    let thumbnailUrl;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer(req.file.buffer, "beverages");
      thumbnailUrl = uploaded.secure_url;
    }
    const beverage = await beverageService.addBeverageService(
      name,
      thumbnailUrl,
      price,
      stock
    );
    return res.status(201).json(beverage);
  } catch (error) {
    next(error);
  }
};
const updateBeverage = async (req, res, next) => {
  try {
    const { beverageId } = req.params;
    const data = req.body;

    if (req.file?.path) {
      const upload = await uploadFile(req.file.path);
      data.thumbnailUrl = upload.secure_url;
    }

    const result = await beverageService.updateBeverageService(
      beverageId,
      data
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getBeverageById = async (req, res, next) => {
  try {
    const { beverageId } = req.params;

    const beverage = await beverageService.getBeverageByIdService(beverageId);

    return res.status(StatusCodes.OK).json({
      message: "Lấy đồ uống thành công!",
      beverage,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBeverages = async (req, res, next) => {
  try {
    const { page, limit, keyword } = req.query;

    const result = await beverageService.getAllBeveragesService({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      keyword: keyword || "",
    });

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách đồ uống thành công!",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
const beverageController = {
  addBeverage,
  updateBeverage,
  getBeverageById,
  getAllBeverages,
};
export default beverageController;
