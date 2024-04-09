import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(4, "Username must be atleast 2 characters")
    .max(20, "Username must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z
        .string()
        .email({
            message: "Invalid email address"
        }),
    password: z
        .string()
        .min(6, "password must be at least 6 characters")
});