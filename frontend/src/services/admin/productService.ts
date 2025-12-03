import instance from "../../utils/axiosCustomize";
import type {
  ProductResponse,
  ProductDetailResponse,
  ProductVarient,
  ProductRelatedParams,
  ProductListResponse,
  UpdateProductRequest,
} from "../../types/product";
import type { ProductVariant, CreateVariantInput } from "../../types/varient";

// ------------------------------------------
// 1. TẠO PRODUCT (không có file -> JSON)
// ------------------------------------------
export type CreateProductRequest = {
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl?: string; // có thể không gửi, backend sẽ xử lý
  categoryId: number;
};

const createProductService = (data: CreateProductRequest) => {
  return instance.post<ProductResponse>("/admin/product/add", data);
};

// ------------------------------------------
// 2. TẠO PRODUCT KÈM FILE (thumbnail là file upload)
// ------------------------------------------
const createProductWithFileService = (formData: FormData) => {
  return instance.post<ProductResponse>("/admin/product/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ------------------------------------------
// 3. TẠO VARIENT
// ------------------------------------------
export type CreateVarientRequest = {
  sku: string;
  price: number;
  stock: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  productId: number;
};

const createProductVarientService = (data: CreateVarientRequest) => {
  return instance.post<ProductVarient>("/admin/product/varient/add", data);
};

// ------------------------------------------
// 4. UPLOAD NHIỀU HÌNH ẢNH PRODUCT
// ------------------------------------------
const uploadProductImagesService = (productId: number, files: File[]) => {
  const formData = new FormData();
  formData.append("productId", String(productId));
  files.forEach((f) => formData.append("images", f));

  return instance.post("/admin/product/images/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ------------------------------------------
// 5. LẤY DANH SÁCH SẢN PHẨM (lọc theo params)
// ------------------------------------------
const getProductsService = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  return instance.get<ProductListResponse>("/admin/product", {
    params: { page, limit, search },
  });
};

// ------------------------------------------
// 6. LẤY SẢN PHẨM LIÊN QUAN
// ------------------------------------------
const getRelatedProductsService = (params: ProductRelatedParams) => {
  return instance.get<ProductResponse[]>("/admin/product/related", { params });
};

// ------------------------------------------
// 7. LẤY CHI TIẾT PRODUCT
// ------------------------------------------
const getProductDetailService = (id: number) => {
  return instance.get<ProductDetailResponse>(`/admin/product/${id}`);
};

// ------------------------------------------
// 8. CẬP NHẬT PRODUCT
// ------------------------------------------
const updateProductService = (id: number, data: UpdateProductRequest) => {
  return instance.put<ProductResponse>(`/admin/product/${id}`, data);
};

// ------------------------------------------
// 8. CẬP NHẬT PRODUCT CÓ FILE
// ------------------------------------------
const updateProductWithFileService = (id: number, formData: FormData) => {
  return instance.put<ProductResponse>(`/admin/product/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
// ------------------------------------------
// 9. LẤY VARIANTS THEO PRODUCT ID
// ------------------------------------------
export const getVariantsByProductIdService = (productId: number) => {
  return instance.get<{ message: string; data: ProductVariant[] }>(
    `/admin/product/${productId}/variants`
  );
};

export const getVariantByIdService = (id: number) => {
  return instance.get<ProductVariant>(`/admin/variants/${id}`);
};

export const createVariantService = (data: CreateVariantInput) => {
  return instance.post<ProductVariant>(
    `/admin/product/${data.productId}/variants`,
    data
  );
};

export const updateVariantService = (id: number, data: ProductVariant) => {
  return instance.put<ProductVariant>(`/admin/variants/${id}`, data);
};

export const deleteVariantService = (id: number) => {
  return instance.delete(`/admin/variants/${id}`);
};
// ------------------------------------------
// EXPORT
// ------------------------------------------
const productService = {
  createProductService,
  createProductWithFileService,
  createProductVarientService,
  uploadProductImagesService,
  getProductsService,
  getRelatedProductsService,
  getProductDetailService,
  updateProductService,
  updateProductWithFileService,
};

export default productService;
