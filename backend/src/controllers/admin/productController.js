import productAdminService from "../../services/admin/productService.js";
import uploadBuffer from "../../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";

const createProduct = async (req, res, next) => {
  try {
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
    console.error("Create product error:", error);
    next(error);
  }
};

const createProductVariant = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const { sku, price, stock, discount, color, size, material } = req.body;
    const productVarient =
      await productAdminService.createProductVariantService(
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

const getProductVariantsByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants =
      await productAdminService.getProductVariantsByProductIdService(productId);

    return res.status(200).json({
      message: "Lấy danh sách biến thể thành công!",
      data: variants,
    });
  } catch (error) {
    next(error);
  }
};
const getProductVariantById = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    const variant = await productAdminService.getProductVariantByIdService(
      variantId
    );

    return res.status(200).json({
      message: "Lấy thông tin biến thể thành công!",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};
const updateProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { sku, price, stock, discount, color, size, material } = req.body;

    const updated = await productAdminService.updateProductVariantService(
      variantId,
      sku,
      price,
      stock,
      discount,
      color,
      size,
      material
    );

    res.status(200).json({
      message: "Cập nhật biến thể thành công!",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    await productAdminService.deleteProductVariantService(variantId);

    return res.status(StatusCodes.OK).json({
      message: "Xóa biến thể thành công!",
    });
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

export const getProductsWithPage = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await productAdminService.getProductsService(
      page,
      limit,
      search
    );

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Lấy danh sách product thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await productAdminService.getProductByIdService(productId);

    return res.status(StatusCodes.OK).json({
      message: "Lấy thông tin sản phẩm thành công!",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { productName, brand, description, categoryId } = req.body;
    const { productId } = req.params;

    // Upload thumbnail mới nếu có
    let thumbnailUrl = null;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer(
        req.file.buffer,
        "products/thumbnails"
      );
      thumbnailUrl = uploaded.secure_url;
    }

    const updated = await productAdminService.updateProductService(
      productId,
      productName,
      brand,
      description,
      thumbnailUrl, // null nếu không upload ảnh → service giữ ảnh cũ
      categoryId
    );

    return res.status(StatusCodes.OK).json({
      message: "Cập nhật sản phẩm thành công!",
      data: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    next(error);
  }
};
const createProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Bạn chưa upload ảnh nào!" });
    }

    const imageUrls = [];

    for (const file of req.files) {
      const uploaded = await uploadBuffer(file.buffer, "products/images");
      imageUrls.push(uploaded.secure_url);
    }

    const productImages = await productAdminService.createProductImagesService(
      imageUrls,
      productId
    );

    return res.status(201).json({
      message: "Thêm ảnh sản phẩm thành công!",
      data: productImages,
    });
  } catch (error) {
    next(error);
  }
};
const getProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const images = await productAdminService.getProductImagesService(productId);

    return res.status(200).json({
      message: "Lấy danh sách ảnh thành công!",
      data: images,
    });
  } catch (error) {
    next(error);
  }
};
const deleteProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    await productAdminService.deleteProductImageService(imageId);

    return res.status(200).json({
      message: "Xóa ảnh thành công!",
    });
  } catch (error) {
    next(error);
  }
};
const updateProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Bạn chưa upload ảnh!" });
    }

    const uploaded = await uploadBuffer(req.file.buffer, "products/images");

    const updated = await productAdminService.updateProductImageService(
      imageId,
      uploaded.secure_url
    );

    return res.status(200).json({
      message: "Cập nhật ảnh thành công!",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const productController = {
  createProduct,
  createProductVariant,
  createProductImages,
  getProductImages,
  getAllProducts,
  getProductVariantsByProductId,
  getProductVariantById,
  updateProductVariant,
  updateProductImage,
  getProductsWithPage,
  getProductById,
  updateProduct,
  deleteProductVariant,
  deleteProductImage,
};
export default productController;
