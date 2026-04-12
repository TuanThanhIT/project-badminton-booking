import { z } from "zod";

export const FormForgotPasswordSchema = z.object({
  email: z.string().email("Email đăng ký không hợp lệ!"),
});

export type formForgotPassword = z.infer<typeof FormForgotPasswordSchema>;

export const FormResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu phải ít nhất 8 ký tự!")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa!")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường!")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số!")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt!"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp!",
    path: ["confirmPassword"], // báo lỗi ở trường confirmPassword
  });

export type formResetPassword = z.infer<typeof FormResetPasswordSchema>;
