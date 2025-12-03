import { z } from "zod";

export const FormCancelOrderSchema = z.object({
  cancelReason: z.string().min(10, "Lý do hủy đơn phải có ít nhất 10 ký tự!"),
});

export type formCancelOrder = z.infer<typeof FormCancelOrderSchema>;
