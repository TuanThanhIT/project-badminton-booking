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
// services/productService.ts
const uploadProductImagesService = (productId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));

  return instance.post(`/admin/product/${productId}/images`, formData, {
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
const getVariantsByProductIdService = (productId: number) => {
  return instance.get<{ message: string; data: ProductVariant[] }>(
    `/admin/product/${productId}/variants`
  );
};
// ------------------------------------------
// 10. LẤY VARIANTS THEO ID
// ------------------------------------------
const getVariantByIdService = (variantId: number) => {
  return instance.get<{ message: string; data: ProductVariant }>(
    `/admin/product/variant/${variantId}`
  );
};
// ------------------------------------------
// 11. TẠO VARIANTS
// ------------------------------------------
const createVariantService = (data: CreateVariantInput) => {
  return instance.post<{ message: string; data: ProductVariant }>(
    `/admin/product/${data.productId}/variants`,
    data
  );
};
// ------------------------------------------
// 12. EDIT VARIANTS
// ------------------------------------------
const updateVariantService = (
  variantId: number,
  data: Partial<ProductVariant>
) => {
  return instance.put<{ message: string; data: ProductVariant }>(
    `/admin/product/variant/${variantId}`,
    data
  );
};
// ------------------------------------------
// 12. DELETE VARIANTS
// ------------------------------------------
const deleteVariantService = (variantId: number) => {
  return instance.delete(`/admin/product/variant/${variantId}`);
};
// Lấy ảnh
const getProductImagesService = (pid: number) => {
  return instance.get(`/admin/product/${pid}/images`);
};

// Xóa ảnh
const deleteProductImageService = (imageId: number) => {
  return instance.delete(`/admin/product/images/${imageId}`);
};

// Edit ảnh
const updateProductImageService = (imageId: number, file: File) => {
  const fd = new FormData();
  fd.append("image", file);
  return instance.put(`/admin/product/images/${imageId}`, fd);
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
  updateVariantService,
  updateProductImageService,
  getVariantsByProductIdService,
  getVariantByIdService,
  createVariantService,
  deleteVariantService,
  getProductImagesService,
  deleteProductImageService,
};

export default productService;
