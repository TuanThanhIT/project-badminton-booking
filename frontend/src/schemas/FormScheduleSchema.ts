import { z } from "zod";

export const FormScheduleSchema = z.object({
  startDate: z
    .string()
    .min(1, "Ngày tạo không được bỏ trống")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày tạo phải ở định dạng YYYY-MM-DD"),
});
