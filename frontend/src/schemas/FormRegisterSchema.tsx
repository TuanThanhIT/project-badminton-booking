import { z } from "zod";

export const FormRegisterSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc!"),
  email: z.string().trim().email("Email không hợp lệ!"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự!")
    .max(50, "Mật khẩu có tối đa 50 ký tự!"),
});

export type formRegister = z.infer<typeof FormRegisterSchema>;
