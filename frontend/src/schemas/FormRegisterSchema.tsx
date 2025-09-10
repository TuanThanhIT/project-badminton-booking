import { z } from "zod";

export const FormRegisterSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters"),
});

export type formRegister = z.infer<typeof FormRegisterSchema>;
