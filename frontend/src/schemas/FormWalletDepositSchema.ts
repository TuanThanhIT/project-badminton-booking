import z from "zod";

export const FormWalletDepositSchema = z.object({
  amount: z.number().min(1, "Giá trị nạp phải lớn hơn 0"),
});

export type formWalletDeposit = z.infer<typeof FormWalletDepositSchema>;
