import { z } from "zod"

export const GetUserSchema = z.object({
    userId: z.uuid()
})
export const GetUserFromSessionSchema = z.object({
    sessionId: z.string()
})
export const GetUserFromClerkSchema = z.object({
    externalAuthId: z.string()
})

export type GetUserDTO = z.infer<typeof GetUserSchema>
export type GetUserFromSessionDTO = z.infer<typeof GetUserFromSessionSchema>
export type GetUserFromClerkDTO = z.infer<typeof GetUserFromClerkSchema>

export interface GetUserResponseDTO {
    id: string
    email: string
    firstName: string
    lastName: string | null
    fullName: string
    status: string
    role: string
    createdAt: Date
    updatedAt: Date
}