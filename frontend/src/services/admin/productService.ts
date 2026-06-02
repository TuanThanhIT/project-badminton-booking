import instance from "../../utils/axiosCustomize";

export interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string;
  menuGroup?: string;
}

const getProductsService = (params: AdminProductsParams) =>
  instance.get("/admin/products", { params });

const getProductDetailService = (productId: number) =>
  instance.get(`/admin/products/${productId}`);

const getCategoriesService = () =>
  instance.get("/admin/products/categories");

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

const adminProductService = {
  getProductsService,
  getProductDetailService,
  getCategoriesService,
  createProductService,
  updateProductService,
  deleteProductService,
};

export default adminProductService;
