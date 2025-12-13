import beverageService from "../../services/admin/beverageService.js";
import uploadBuffer from "../../utils/cloudinary.js";

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
const beverageController = {
  addBeverage,
};
export default beverageController;
