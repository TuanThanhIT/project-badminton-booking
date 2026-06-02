import { z } from "zod";

const timeSchema = z
  .string()
  .min(1, "Vui lòng chọn giờ")
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ");

const timeToMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

export const FormCreateCourtSchema = z.object({
  courtName: z.string().trim().min(1, "Tên sân không được để trống"),
  location: z.string().trim().min(1, "Vị trí không được để trống"),
  thumbnailUrl: z.string(),
});

export type FormCreateCourt = z.infer<typeof FormCreateCourtSchema>;

export const FormCreateCourtPriceSchema = z
  .object({
    dayOfWeek: z.enum(
      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      { message: "Vui lòng chọn thứ" },
    ),
    startTime: timeSchema,
    endTime: timeSchema,
    price: z
      .number({ message: "Vui lòng nhập giá sân" })
      .finite("Giá sân không hợp lệ")
      .min(1000, "Giá phải lớn hơn hoặc bằng 1.000 VNĐ"),
    periodType: z.enum(["DAYTIME", "EVENING", "WEEKEND"], {
      message: "Vui lòng chọn loại khung giờ",
    }),
  })
  .refine((data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime), {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

export type FormCreateCourtPrice = z.infer<typeof FormCreateCourtPriceSchema>;
