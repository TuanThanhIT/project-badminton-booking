import z from "zod";

export const FormWithdrawRequestSchema = z.object({
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  bankName: z.string().min(1, "Tên ngân hàng không được để trống!"),
  bankAccount: z
    .string()
    .trim()
    .min(6, "Số tài khoản không hợp lệ")
    .max(30, "Số tài khoản không quá dài")
    .regex(/^\d+$/, "Số tài khoản chỉ được chứa số"),
  accountHolder: z
    .string()
    .trim()
    .min(2, "Tên phải ít nhất 2 ký tự")
    .max(100, "Tên không quá 100 ký tự")
    .regex(/^[A-Za-zÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng"),
});

export type formWithdrawRequest = z.infer<typeof FormWithdrawRequestSchema>;
