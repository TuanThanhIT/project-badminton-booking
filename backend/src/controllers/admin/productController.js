import productService from "../../services/admin/productService.js";
import uploadFile from "../../utils/upload.js";

const createProduct = async (req, res, next) => {
  try {
    const { productName, brand, description, categoryId } = req.body;

    // Nếu có file avatar
    let thumbnailUrl;
    if (req.file?.path) {
      const upload = await uploadFile(req.file.path);
      thumbnailUrl = upload.secure_url;
    }

    const product = await productService.createProductService(
      productName,
      brand,
      description,
      thumbnailUrl,
      categoryId
    );
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const createProductVarient = async (req, res, next) => {
  try {
    const { sku, price, stock, discount, color, size, material, productId } =
      req.body;
    const productVarient = await productService.createProductVarientService(
      sku,
      price,
      stock,
      discount,
      color,
      size,
      material,
      productId
    );
    return res.status(201).json(productVarient);
  } catch (error) {
    next(error);
  }
};

const createProductImages = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const images = [];
    const files = req.files;
    for (const file of files) {
      const upload = await uploadFile(file.path);
      const image = upload.secure_url || null;
      images.push(image);
    }
    const productImages = await productService.createProductImagesService(
      images,
      productId
    );
    return res.status(201).json(productImages);
  } catch (error) {
    next(error);
  }
};

const productController = {
  createProduct,
  createProductVarient,
  createProductImages,
};
export default productController;
