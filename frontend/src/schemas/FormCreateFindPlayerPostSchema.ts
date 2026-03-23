import { z } from "zod";

const LevelEnum = z.enum(["Beginner", "Intermediate", "Advanced", "Custom"]);

export const FormCreateFindPlayerPostSchema = z.object({
  title: z
    .string()
    .min(3, "Tiêu đề tối thiểu 3 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z
    .string()
    .max(2000, "Mô tả tối đa 2000 ký tự")
    .optional(),
  type: z.literal("Find_player"),
  formData: z.object({
    location: z.object({
      branchId: z.number().int().min(1, "Vui lòng chọn chi nhánh"),
      courtId: z.number().int().min(1, "Vui lòng chọn sân"),
    }),
    schedule: z.object({
      date: z.string().min(1, "Vui lòng chọn ngày"),
      startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
      endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    }),
    playerRequirement: z.object({
      level: LevelEnum,
      customLevel: z.string().nullable().optional(),
      slotsNeeded: z
        .number()
        .int()
        .min(1, "Cần ít nhất 1 slot"),
    }),
    cost: z.object({
      method: z.string().min(1, "Vui lòng chọn hình thức thanh toán"),
      note: z.string().nullable().optional(),
    }),
    contact: z.object({
      inApp: z.boolean(),
      phone: z.string().nullable().optional(),
      zalo: z.string().nullable().optional(),
    }),
    notes: z.string().nullable().optional(),
  }),
});

export type formCreateFindPlayerPost = z.infer<
  typeof FormCreateFindPlayerPostSchema
>;