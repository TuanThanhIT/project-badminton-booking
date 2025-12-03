import { z } from "zod";

export const FormRatingSchema = z.object({
  rating: z
    .number()
    .min(1, "Vui lòng chọn số sao đánh giá (từ 1 đến 5).")
    .max(5, "Số sao đánh giá không hợp lệ."),
  content: z
    .string()
    .min(10, "Nội dung đánh giá quá ngắn, vui lòng viết ít nhất 10 ký tự.")
    .max(500, "Nội dung đánh giá quá dài, tối đa 500 ký tự."),
});

export type formRating = z.infer<typeof FormRatingSchema>;
