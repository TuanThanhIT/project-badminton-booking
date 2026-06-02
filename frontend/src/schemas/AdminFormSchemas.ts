import { z } from "zod";

const optionalPositiveNumber = z.union([
  z.literal(""),
  z.number().nonnegative("Giá trị không hợp lệ"),
]);

export const AdminCategoryFormSchema = z.object({
  cateName: z.string().trim().min(1, "Vui lòng nhập tên danh mục"),
  menuGroup: z.string().trim().min(1, "Vui lòng chọn nhóm menu"),
});

export type AdminCategoryForm = z.infer<typeof AdminCategoryFormSchema>;

export const AdminProductFormSchema = z.object({
  productName: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm"),
  brand: z.string().trim().min(1, "Vui lòng nhập thương hiệu"),
  description: z
    .string()
    .trim()
    .min(10, "Mô tả phải có ít nhất 10 ký tự"),
  thumbnailUrl: z.string().trim().min(1, "Vui lòng chọn ảnh đại diện"),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
});

export type AdminProductForm = z.infer<typeof AdminProductFormSchema>;

export const AdminBeverageFormSchema = z.object({
  beverageName: z.string().trim().min(1, "Vui lòng nhập tên đồ uống"),
  thumbnailUrl: z.string().trim().optional(),
  price: z
    .number({ message: "Vui lòng nhập giá" })
    .finite("Giá không hợp lệ")
    .min(0, "Giá không được âm"),
});

export type AdminBeverageForm = z.infer<typeof AdminBeverageFormSchema>;

export const AdminDiscountFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập mã giảm giá")
      .transform((value) => value.toUpperCase()),
    type: z.enum(["AMOUNT", "PERCENT"], {
      message: "Vui lòng chọn loại giảm giá",
    }),
    applyType: z.enum(["ALL", "ORDER", "BOOKING"], {
      message: "Vui lòng chọn phạm vi áp dụng",
    }),
    value: z.number().min(1, "Giá trị giảm phải lớn hơn 0"),
    maxDiscount: optionalPositiveNumber,
    minAmount: z.number().min(0, "Đơn tối thiểu không được âm"),
    usageLimit: z.union([
      z.literal(""),
      z.number().int("Giới hạn phải là số nguyên").min(1, "Giới hạn phải lớn hơn 0"),
    ]),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  })
  .refine((data) => data.type !== "PERCENT" || data.value <= 100, {
    message: "Phần trăm giảm tối đa là 100%",
    path: ["value"],
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
    path: ["endDate"],
  });

export type AdminDiscountForm = z.infer<typeof AdminDiscountFormSchema>;

export const AdminBranchFormSchema = z.object({
  branchName: z.string().trim().min(1, "Tên chi nhánh không được để trống"),
  phoneNumber: z.string().trim().min(1, "Số điện thoại không được để trống"),
  description: z.string().trim().min(10, "Mô tả tối thiểu 10 ký tự"),
  address: z.string().trim().min(1, "Địa chỉ không được để trống"),
  districtName: z.string().trim().min(1, "Quận/Huyện không được để trống"),
  provinceName: z.string().trim().min(1, "Tỉnh/Thành không được để trống"),
  wardName: z.string().trim().min(1, "Phường/Xã không được để trống"),
  provinceId: z.number().min(1, "Province ID không được để trống"),
  districtId: z.number().min(1, "District ID không được để trống"),
  wardCode: z.string().trim().min(1, "Vui lòng chọn Phường/Xã"),
  latitude: z.number().refine((value) => value !== 0, {
    message: "Vui lòng chọn vị trí trên bản đồ",
  }),
  longitude: z.number(),
  ghnShopId: z.number().optional(),
});

export const AdminBranchUpdateFormSchema = AdminBranchFormSchema.extend({
  description: z.string().optional(),
  provinceId: z.number().optional(),
  districtId: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AdminBranchForm = z.infer<typeof AdminBranchFormSchema>;

export const AdminCreateManagerFormSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type AdminCreateManagerForm = z.infer<typeof AdminCreateManagerFormSchema>;
