import { z } from "zod";

export const FormCreateCourtSchema = z.object({
  courtName: z.string().trim().min(1, "Tên sân không được để trống"),
  location: z.string().trim().min(1, "Vị trí không được để trống"),
  thumbnailUrl: z.string(),
});

export type FormCreateCourt = z.infer<typeof FormCreateCourtSchema>;

export const FormCreateCourtPriceSchema = z.object({
  dayOfWeek: z.string().min(1, "Vui lòng chọn thứ"),

  startTime: z.string().min(1, "Vui lòng nhập giờ bắt đầu"),

  endTime: z.string().min(1, "Vui lòng nhập giờ kết thúc"),

  price: z.number().min(1000, "Giá phải lớn hơn 1000"),

  periodType: z.string().min(1, "Vui lòng chọn loại khung giờ"),
});

export type FormCreateCourtPrice = z.infer<typeof FormCreateCourtPriceSchema>;
