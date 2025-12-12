import { z } from "zod";

export const FormCreateCategorySchema = z.object({
  cateName: z
    .string()
    .nonempty("Tên danh mục không được để trống")
    .regex(
      /^[a-zA-Z0-9À-ỹ\s]+$/,
      "Tên danh mục phải là bắt buộc và chỉ chứa chữ và số"
    ),

  menuGroup: z
    .string()
    .nonempty("Nhóm menu không được để trống")
    .regex(
      /^[a-zA-Z0-9À-ỹ\s]+$/,
      "Nhóm menu là bắt buộc và chỉ chứa chữ và số"
    ),
});

// Sinh type cho form
export type FormCreateCategory = z.infer<typeof FormCreateCategorySchema>;
