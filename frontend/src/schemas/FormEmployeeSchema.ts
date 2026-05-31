import { z } from "zod";

export const FormEmployeeSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được gồm chữ, số và dấu gạch dưới",
    ),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(255, "Họ tên không được vượt quá 255 ký tự"),
  phoneNumber: z
    .string()
    .trim()
    .min(9, "Số điện thoại không hợp lệ")
    .max(11, "Số điện thoại không hợp lệ")
    .regex(/^[0-9]{9,11}$/, "Số điện thoại chỉ được gồm 9 đến 11 chữ số"),
  address: z
    .string()
    .trim()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  gender: z.enum(["male", "female", "other"], {
    message: "Vui lòng chọn giới tính",
  }),
});

export type FormEmployee = z.infer<typeof FormEmployeeSchema>;
