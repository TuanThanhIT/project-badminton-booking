import { z } from "zod";

export const FormDiscountSchema = z.object({
  code: z
    .string()
    .min(3, "Mã giảm giá phải có ít nhất 3 ký tự.")
    .max(30, "Mã giảm giá tối đa 30 ký tự.")
    .trim()
    .transform((val) => val.toUpperCase()),
});

export type FormDiscount = z.infer<typeof FormDiscountSchema>;
