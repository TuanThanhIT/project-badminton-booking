import { z } from "zod";

export const FormRatingSchema = z.object({
  rating: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),

  content: z
    .string()
    .min(10, "Nội dung đánh giá quá ngắn, vui lòng viết ít nhất 10 ký tự.")
    .max(500, "Nội dung đánh giá quá dài, tối đa 500 ký tự."),
});

export type formRating = z.infer<typeof FormRatingSchema>;
