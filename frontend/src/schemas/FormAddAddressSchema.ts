import { z } from "zod";

export const FormAddAddressSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),

    address: z.string().trim().min(1, "Vui lòng nhập địa chỉ cụ thể"),

    provinceId: z.string().min(1, "Vui lòng chọn tỉnh"),

    districtId: z.string().min(1, "Vui lòng chọn quận"),

    wardCode: z.string().min(1, "Vui lòng chọn phường"),

    latitude: z.number().nullable(),
    longitude: z.number().nullable(),

    label: z.enum(["HOME", "OFFICE"], {
      message: "Loại địa chỉ không hợp lệ",
    }),

    isDefault: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.latitude == null || data.longitude == null) {
      ctx.addIssue({
        code: "custom",
        path: ["latitude"],
        message: "Vui lòng chọn vị trí trên bản đồ",
      });
    }
  });

export type FormAddAddress = z.infer<typeof FormAddAddressSchema>;

export type AddOrUpdateAddressPayload = FormAddAddress & {
  provinceName: string;
  districtName: string;
  wardName: string;
  addressId?: number;
};
