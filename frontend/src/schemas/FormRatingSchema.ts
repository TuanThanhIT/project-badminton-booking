import { z } from "zod";

export const FormRatingSchema = z.object({
  rating: z
    .number()
    .min(1, "Vui lòng chọn số sao đánh giá (từ 1 đến 5).")
    .max(5, "Số sao đánh giá không hợp lệ."),
  content: z.string().min(1, "Vui lòng nhập nội dung đánh giá sản phẩm."),
});

export type formRating = z.infer<typeof FormRatingSchema>;
