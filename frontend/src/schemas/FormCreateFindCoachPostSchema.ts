import { z } from "zod";
import { PLAYER_LEVELS } from "../utils/constants/profileConstant";

export const FormCreateFindCoachPostSchema = z.object({
  title: z
    .string()
    .min(3, "Tieu de toi thieu 3 ky tu")
    .max(200, "Tieu de toi da 200 ky tu"),
  content: z.string().max(2000, "Mo ta toi da 2000 ky tu").optional(),
  type: z.literal("FIND_COACH"),
  formData: z.object({
    location: z.object({
      branchId: z.number().int().min(1, "Vui long chon chi nhanh"),
    }),
    currentLevel: z.enum(PLAYER_LEVELS, {
      message: "Vui long chon trinh do hien tai",
    }),
    goal: z.string().trim().min(1, "Vui long nhap muc tieu hoc"),
    scheduleNote: z.string().trim().min(1, "Vui long nhap thoi gian mong muon"),
    budget: z.string().nullable().optional(),
    contact: z.object({
      inApp: z.boolean(),
      phone: z.string().nullable().optional(),
      zalo: z.string().nullable().optional(),
    }),
    notes: z.string().nullable().optional(),
  }),
});

export type formCreateFindCoachPost = z.infer<
  typeof FormCreateFindCoachPostSchema
>;
