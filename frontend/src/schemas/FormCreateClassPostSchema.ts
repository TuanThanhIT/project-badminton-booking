import { z } from "zod";

export const FormCreateClassPostSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().max(2000, "Mô tả tối đa 2000 ký tự").optional(),

  type: z.literal("Class"),

  formData: z.object({
    inputLevel: z.string().min(1, "Vui lòng nhập level"),
    ageRange: z.string().min(1, "Vui lòng nhập độ tuổi"),

    schedule: z.object({
      weekdays: z.array(z.number().int()).min(1, "Vui lòng chọn ít nhất 1 ngày"),
      startTime: z.string().min(1, "Vui lòng chọn startTime"),
      endTime: z.string().min(1, "Vui lòng chọn endTime"),
      startDate: z.string().min(1, "Vui lòng chọn startDate"),
    }),

    location: z.object({
      branchId: z.number().int().min(1, "Vui lòng chọn chi nhánh"),
      address: z.string().min(1, "Vui lòng nhập địa chỉ"),
    }),

    maxStudents: z.number().int().min(1, "Max students phải >= 1"),

    tuition: z.object({
      type: z.string().min(1, "Vui lòng nhập loại học phí"),
      amount: z.number().int().min(0, "Số tiền không hợp lệ"),
      currency: z.string().min(1, "Vui lòng nhập currency"),
      note: z.string().nullable().optional(),
    }),

    registerEndDate: z.string().min(1, "Vui lòng chọn registerEndDate"),
    paymentMethod: z.string().min(1, "Vui lòng nhập paymentMethod"),

    contact: z.object({
      inAppChat: z.boolean(),
      phone: z.string().nullable().optional(),
      zalo: z.string().nullable().optional(),
    }),

    notes: z.string().nullable().optional(),
  }),
});

export type formCreateClassPost = z.infer<typeof FormCreateClassPostSchema>;

