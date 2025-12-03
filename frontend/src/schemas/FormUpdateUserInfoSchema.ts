import { z } from "zod";

export const FormUpdateUserInfoSchema = z.object({
  fullName: z.string().min(1, "Tên khách hàng không được để trống!"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại không được để trống!")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ!"),
  address: z.string().min(1, "Địa chỉ khách hàng không được để trống!"),
});

export type formUpdateUserInfo = z.infer<typeof FormUpdateUserInfoSchema>;
