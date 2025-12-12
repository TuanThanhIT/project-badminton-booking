import { z } from "zod";

export const FormCreateCourtSchema = z.object({
  name: z.string().min(1, "Tên sân không được bỏ trống"),
  location: z.string().min(1, "Vị trí không được bỏ trống"),
});
