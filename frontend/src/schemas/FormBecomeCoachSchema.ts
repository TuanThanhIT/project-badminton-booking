import { z } from "zod";

export const FormBecomeCoachSchema = z.object({
  experienceYears: z.coerce
    .number()
    .int("Số năm kinh nghiệm phải là số nguyên")
    .min(0, "Tối thiểu 0 năm")
    .max(50, "Tối đa 50 năm"),
  certificate: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập thông tin chứng chỉ")
    .max(500, "Tối đa 500 ký tự"),
  introduction: z
    .string()
    .trim()
    .min(20, "Giới thiệu cần ít nhất 20 ký tự")
    .max(2000, "Tối đa 2000 ký tự"),
  phoneContact: z.string().trim().max(20).optional().or(z.literal("")),
});

export type FormBecomeCoach = z.infer<typeof FormBecomeCoachSchema>;
