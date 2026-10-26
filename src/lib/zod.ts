import { object, string } from "zod"
 
export const signInSchema = object({
  email: string({ error: (issue) => issue.input === undefined ? "Email is required" : undefined })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ error: (issue) => issue.input === undefined ? "Password is required" : undefined })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})
