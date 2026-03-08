import productAdminService from "../../services/admin/productService.js";
import uploadBuffer from "../../utils/cloudinary.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const createProduct = asyncHandler(async (req, res) => {
  // Nếu có file avatar
  let thumbnailUrl = null;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "products/thumbnails");
    thumbnailUrl = uploaded.secure_url;
  }
  const data = { ...req.body, thumbnailUrl };
  const product = await productAdminService.createProductService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo sản phẩm thành công", product));
});

const createProductVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId, ...req.body };
  const productVarient =
    await productAdminService.createProductVariantService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Tạo biến thể sản phẩm thành công", productVarient),
    );
});

const getProductVariantsByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId };
  const variants =
    await productAdminService.getProductVariantsByProductIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách biến thể thành công", variants));
});

const getProductVariantById = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const data = { variantId };
  const variant = await productAdminService.getProductVariantByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin biến thể thành công", variant));
});

const updateProductVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const updateData = { ...req.body };
  const data = { variantId, updateData };
  const variant = await productAdminService.updateProductVariantService(data);
  res
    .status(200)
    .json(new SuccessResponse("Cập nhật biến thể thành công", variant));
});

const deleteProductVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const data = { variantId };
  await productAdminService.deleteProductVariantService(data);
  return res.status(200).json(new SuccessResponse("Xóa biến thể thành công"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productAdminService.getAllProductsService();
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy danh sách tất cả sản phẩm thành công", products),
    );
});

export const getProducts = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await productAdminService.getProductsService(data);
  res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách sản phẩm thành công", result));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId };
  const product = await productAdminService.getProductByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin sản phẩm thành công", product));
});

const updateProduct = asyncHandler(async (req, res) => {
  let thumbnailUrl = null;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "products/thumbnails");
    thumbnailUrl = uploaded.secure_url;
  }
  const { productId } = req.params;
  const updateData = { ...req.body, thumbnailUrl };
  const data = { productId, updateData };
  const product = await productAdminService.updateProductService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật sản phẩm thành công", product));
});

const createProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const thumbnailUrls = [];
  for (const file of req.files) {
    const uploaded = await uploadBuffer(file.buffer, "products/images");
    thumbnailUrls.push(uploaded.secure_url);
  }
  const data = { imageUrls: thumbnailUrls, productId };
  const productImages =
    await productAdminService.createProductImagesService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Thêm ảnh sản phẩm thành công", productImages));
});

const getProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId };
  const images = await productAdminService.getProductImagesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách ảnh sản phẩm thành công", images));
});

const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const data = { imageId };
  await productAdminService.deleteProductImageService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa ảnh sản phẩm thành công"));
});

const updateProductImage = asyncHandler(async (req, res) => {
  let thumbnailUrl = null;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "products/images");
    thumbnailUrl = uploaded.secure_url;
  }
  const { imageId } = req.params;
  const updateData = { imageUrl: thumbnailUrl };
  const data = { imageId, updateData };
  const image = await productAdminService.updateProductImageService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật ảnh thành công", image));
});

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
  getProducts,
  getProductById,
  updateProduct,
  deleteProductVariant,
  deleteProductImage,
};
export default productController;
