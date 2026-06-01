import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Thời gian phải có dạng HH:mm");

export const FormWorkShiftSchema = z
  .object({
    shiftName: z.string().trim().min(2, "Tên ca phải có ít nhất 2 ký tự"),
    workDate: z.string().min(1, "Vui lòng chọn ngày làm việc"),
    startTime: timeSchema,
    endTime: timeSchema,
    cashierShiftWage: z.coerce
      .number()
      .min(0, "Lương thu ngân không được âm"),
    staffShiftWage: z.coerce
      .number()
      .min(0, "Lương nhân viên không được âm"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
    path: ["endTime"],
  });

export const FormShiftAssignmentSchema = z.object({
  employeeId: z.coerce.number().int().positive("Vui lòng chọn nhân viên"),
  roleInShift: z.enum(["STAFF", "CASHIER"], {
    message: "Vai trò trong ca không hợp lệ",
  }),
});

export type FormWorkShift = z.infer<typeof FormWorkShiftSchema>;
export type FormShiftAssignment = z.infer<typeof FormShiftAssignmentSchema>;
