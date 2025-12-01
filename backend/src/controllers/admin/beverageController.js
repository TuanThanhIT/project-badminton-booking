import beverageService from "../../services/admin/beverageService.js";
import uploadFile from "../../utils/upload.js";

const addBeverage = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    let thumbnailUrl;
    if (req.file?.path) {
      const upload = await uploadFile(req.file.path);
      thumbnailUrl = upload.secure_url;
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
const beverageController = {
  addBeverage,
};
export default beverageController;
