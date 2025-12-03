import { z } from "zod";

export const FormCreateVariantSchema = z.object({
  sku: z.string().min(1, "SKU không được bỏ trống"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  stock: z.number().min(0, "Tồn kho không được âm"),
  discount: z
    .number()
    .min(0, "Discount không được nhỏ hơn 0")
    .max(100, "Discount không được quá 100"),
  color: z.string().min(1, "Màu không được bỏ trống"),
  size: z.string().min(1, "Size không được bỏ trống"),
  material: z.string().min(1, "Material không được bỏ trống"),
});
