import { z } from "zod"

export const RegisterUserSchema = z.object({
    firstName: z.string()
        .min(2, "First name must be at least 2 characters long.")
        .max(30, "First name must be at most 30 characters long.")
        .trim(),
    lastName: z.string()
        .min(2, "Last name must be at least 2 characters long.")
        .max(30, "Last name must be at most 30 characters long.")
        .trim()
        .optional(),
    email: z.email({ pattern: z.regexes.email }),
    password: z.string().min(8, "Password is too short.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase character.")
        .regex(/[a-z]/, "Password must contain at least one lower case character.")
        .regex(/[0-9]/, "Password must contain at least one number.")
})

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>

export interface RegisterUserResponseDTO {
    id: string
    fullName: string
    email: string
    createdAt: Date
    updatedAt: Date
}