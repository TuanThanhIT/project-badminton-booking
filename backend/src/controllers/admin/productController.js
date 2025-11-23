import productAdminService from "../../services/admin/productService.js";
import uploadBuffer from "../../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";

const createProduct = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    const { productName, brand, description, categoryId } = req.body;

    // Nếu có file avatar
    let thumbnailUrl = null;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer(
        req.file.buffer,
        "products/thumbnails"
      );
      thumbnailUrl = uploaded.secure_url;
    }

    const product = await productAdminService.createProductService(
      productName,
      brand,
      description,
      thumbnailUrl,
      categoryId
    );
    return res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", err);
    next(error);
  }
};

const createProductVarient = async (req, res, next) => {
  try {
    const { sku, price, stock, discount, color, size, material, productId } =
      req.body;
    const productVarient =
      await productAdminService.createProductVarientService(
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
    // for (const file of files) {
    //   const upload = await uploadFile(file.path);
    //   const image = upload.secure_url || null;
    //   images.push(image);
    // }
    for (const file of req.files) {
      const uploaded = await uploadBuffer(file.buffer, "products/images");
      imageUrls.push(uploaded.secure_url);
    }
    const productImages = await productAdminService.createProductImagesService(
      images,
      productId
    );
    return res.status(201).json(productImages);
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productAdminService.getAllProductsService();

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const productController = {
  createProduct,
  createProductVarient,
  createProductImages,
  getAllProducts,
};
export default productController;
