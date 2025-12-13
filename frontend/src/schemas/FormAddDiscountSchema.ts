import { z } from "zod";

export const FormAddDiscountSchema = z.object({
  code: z.string().min(1, "Mã giảm giá không được để trống"), // string bắt buộc
  type: z.string().refine((val) => val === "PERCENT" || val === "AMOUNT", {
    message: "Chọn loại giảm giá Tiền mặt hoặc Phần trăm",
  }),

  value: z
    .string()
    .min(1, "Giá trị không được để trống")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Giá trị phải là số lớn hơn 0",
    }),

  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày bắt đầu không hợp lệ",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Ngày kết thúc không hợp lệ",
  }),

  minOrderAmount: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Đơn tối thiểu phải là số lớn hơn 0",
    }),
});

export type formAddDiscountSchema = z.infer<typeof FormAddDiscountSchema>;
