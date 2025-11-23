import { z } from "zod";

export const FormCreateProductSchema = z.object({
  productName: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .regex(/^[a-zA-Z0-9À-ỹ\s]+$/, "Tên sản phẩm chỉ chứa chữ và số"),

  brand: z
    .string()
    .min(1, "Thương hiệu không được để trống")
    .regex(/^[a-zA-Z0-9À-ỹ\s]+$/, "Thương hiệu chỉ chứa chữ và số"),

  description: z
    .string()
    .min(1, "Mô tả không được để trống")
    .min(10, "Mô tả phải có ít nhất 10 ký tự"),

  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),

  thumbnail: z
    .any()
    .nullable()
    .refine(
      (file) => file === null || file instanceof File,
      "Ảnh tải lên không hợp lệ"
    )
    .optional(),
});

export type FormCreateProduct = z.infer<typeof FormCreateProductSchema>;
