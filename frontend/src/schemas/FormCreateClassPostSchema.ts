import { z } from "zod";
import { CLASS_INPUT_LEVEL_VALUES } from "../constants/postConstant";

export const FormCreateClassPostSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().max(2000, "Mô tả tối đa 2000 ký tự").optional(),

  type: z.literal("CLASS"),

  formData: z.object({
    inputLevel: z.enum(CLASS_INPUT_LEVEL_VALUES, {
      message: "Vui lòng chọn trình độ đầu vào",
    }),
    ageRange: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập độ tuổi")
      .max(120, "Độ tuổi tối đa 120 ký tự"),

    schedule: z.object({
      weekdays: z.array(z.number().int()).min(1, "Vui lòng chọn ít nhất 1 ngày"),
      startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
      endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
      startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    }),

    location: z.object({
      branchId: z.number().int().min(1, "Vui lòng chọn chi nhánh (địa điểm dạy học)"),
    }),

    maxStudents: z.number().int().min(1, "Số học viên tối đa phải >= 1"),

    tuitionFee: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập học phí")
      .max(500, "Học phí tối đa 500 ký tự"),

    contact: z.object({
      inAppChat: z.boolean(),
      phone: z.string().nullable().optional(),
      zalo: z.string().nullable().optional(),
    }),

    notes: z.string().nullable().optional(),
  }),
});

export type formCreateClassPost = z.infer<typeof FormCreateClassPostSchema>;
