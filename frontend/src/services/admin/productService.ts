import instance from "../../utils/axiosCustomize";

export interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string;
}

const getProductsService = (params: AdminProductsParams) =>
  instance.get("/admin/products", { params });

const getProductDetailService = (productId: number) =>
  instance.get(`/admin/products/${productId}`);

const getCategoriesService = () =>
  instance.get("/admin/products/categories");

const getStockBranchesService = () =>
  instance.get("/admin/products/stock-branches");

const createProductService = (data: {
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl: string;
  categoryId: number;
}) => instance.post("/admin/products", data);

const updateProductService = (productId: number, data: Partial<{
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl: string;
  categoryId: number;
}>) => instance.put(`/admin/products/${productId}`, data);

const deleteProductService = (productId: number) =>
  instance.delete(`/admin/products/${productId}`);

const addProductImagesService = (productId: number, thumbnailUrls: string[]) =>
  instance.post(`/admin/products/${productId}/images`, { thumbnailUrls });

const updateProductImageService = (imageId: number, imageUrl: string) =>
  instance.put(`/admin/products/images/${imageId}`, { imageUrl });

const deleteProductImageService = (imageId: number) =>
  instance.delete(`/admin/products/images/${imageId}`);

export type ProductVariantPayload = {
  sku?: string;
  price: number;
  discount?: number;
  color?: string;
  size?: string;
  material?: string;
  weight?: number;
  stocks?: { branchId: number; stock: number }[];
};

const getProductVariantsService = (productId: number) =>
  instance.get(`/admin/products/${productId}/variants`);

const createProductVariantService = (productId: number, data: ProductVariantPayload) =>
  instance.post(`/admin/products/${productId}/variants`, data);

const updateProductVariantService = (variantId: number, data: ProductVariantPayload) =>
  instance.put(`/admin/products/variants/${variantId}`, data);

const deleteProductVariantService = (variantId: number) =>
  instance.delete(`/admin/products/variants/${variantId}`);

const adminProductService = {
  getProductsService,
  getProductDetailService,
  getCategoriesService,
  getStockBranchesService,
  createProductService,
  updateProductService,
  deleteProductService,
  addProductImagesService,
  updateProductImageService,
  deleteProductImageService,
  getProductVariantsService,
  createProductVariantService,
  updateProductVariantService,
  deleteProductVariantService,
};

export default adminProductService;
