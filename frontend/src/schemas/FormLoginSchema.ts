import { z } from "zod";

export const FormLoginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc!"),
  password: z.string().min(1, "Mật khẩu là bắt buộc!"),
});

export type formLogin = z.infer<typeof FormLoginSchema>;
