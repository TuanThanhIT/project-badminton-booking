import { z } from "zod";

export const FormContactSchema = z.object({
  fullName: z.string().min(1, "Tên khách hàng không được để trống!"),
  email: z.string().trim().email("Email không hợp lệ!"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ!"),
  subject: z.string().min(1, "Chủ đề/Thông điệp không được để trống!"),
  message: z.string().min(1, "Nội dung không được để trống!"),
});

export type formContact = z.infer<typeof FormContactSchema>;
