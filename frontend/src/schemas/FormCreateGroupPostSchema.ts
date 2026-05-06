import { z } from "zod";
import { GROUP_LEVEL_VALUES } from "../utils/constants/postConstant";

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

export const FormCreateGroupPostSchema = z
  .object({
    title: z
      .string()
      .min(3, "Tiêu đề tối thiểu 3 ký tự")
      .max(200, "Tiêu đề tối đa 200 ký tự"),

    content: z.string().max(2000, "Mô tả tối đa 2000 ký tự").optional(),

    type: z.literal("GROUP"),

    formData: z.object({
      area: z.object({
        city: z.string().min(1, "Vui lòng nhập thành phố"),
        district: z.string().min(1, "Vui lòng nhập quận/huyện"),
      }),

      weeklySchedule: z.object({
        weekdays: z
          .array(z.number().int())
          .min(1, "Vui lòng chọn ít nhất 1 ngày"),

        startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),

        endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
      }),

      levelWanted: z.enum(GROUP_LEVEL_VALUES, {
        message: "Vui lòng chọn trình độ mong muốn",
      }),

      contact: z.object({
        inApp: z.boolean(),

        // FIXED
        zaloGroupLink: z
          .string()
          .trim()
          .optional()
          .refine(
            (val) => !val || /^https?:\/\/.+/.test(val),
            "Link Zalo không hợp lệ",
          ),
      }),
    }),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data.formData.weeklySchedule;

    const a = timeToMinutes(startTime);
    const b = timeToMinutes(endTime);

    if (!Number.isNaN(a) && !Number.isNaN(b) && b <= a) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giờ kết thúc phải sau giờ bắt đầu",
        path: ["formData", "weeklySchedule", "endTime"],
      });
    }
  });

export type FormCreateGroupPost = z.infer<typeof FormCreateGroupPostSchema>;
