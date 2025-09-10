import { z } from "zod";

export const FormLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type formLogin = z.infer<typeof FormLoginSchema>;
