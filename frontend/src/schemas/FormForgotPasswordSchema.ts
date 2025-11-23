import { z } from "zod";

export const FormForgotPasswordSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"], // báo lỗi ở trường confirmPassword
  });

export type formForgotPassword = z.infer<typeof FormForgotPasswordSchema>;
