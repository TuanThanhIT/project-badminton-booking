import { z } from "zod";

export const FormUpdateUserInfoSchema = z.object({
  fullName: z.string().min(1, "Tên khách hàng là bắt buộc!"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại là bắt buộc!")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ!"),
  address: z.string().min(1, "Địa chỉ khách hàng là bắt buộc!"),
});

export type formUpdateUserInfo = z.infer<typeof FormUpdateUserInfoSchema>;
