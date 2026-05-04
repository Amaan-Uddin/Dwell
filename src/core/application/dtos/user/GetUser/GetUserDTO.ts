import { z } from "zod"

export const GetUserSchema = z.object({
    userId: z.uuid()
})
export const GetUserFromSessionSchema = z.object({
    sessionId: z.string()
})

export type GetUserDTO = z.infer<typeof GetUserSchema>
export type GetUserFromSessionDTO = z.infer<typeof GetUserFromSessionSchema>