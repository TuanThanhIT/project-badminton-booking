import { z } from "zod";

export const FormCreateTournamentPostSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().max(2000, "Mô tả tối đa 2000 ký tự").optional(),
  type: z.literal("Tournament"),
  formData: z.object({
    organizerName: z.string().min(1, "Vui lòng nhập tên ban tổ chức"),
    location: z.object({
      branchId: z.number().int().min(1, "Vui lòng chọn chi nhánh"),
      courtId: z.number().int().min(1, "Vui lòng chọn sân"),
    }),
    registration: z.object({
      startDate: z.string().min(1, "Vui lòng chọn ngày mở đăng ký"),
      endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc đăng ký"),
    }),
    eventDate: z.string().min(1, "Vui lòng chọn ngày diễn ra giải"),
    categories: z.array(z.string().min(1)).min(1, "Vui lòng nhập ít nhất 1 hạng mục"),
    contact: z.object({
      phone: z.string().nullable().optional(),
      email: z.string().email("Email không hợp lệ").nullable().optional(),
      inApp: z.boolean(),
    }),
  }),
});

export type FormCreateTournamentPost = z.infer<typeof FormCreateTournamentPostSchema>;
