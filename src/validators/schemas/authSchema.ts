import { z } from "zod";

export const authSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Not a valid email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must contain at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        "Password must contain a minimum of eight characters, at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export type AuthType = z.infer<typeof authSchema>;
