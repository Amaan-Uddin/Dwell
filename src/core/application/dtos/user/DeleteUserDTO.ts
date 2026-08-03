import { z } from "zod"

export const DeleteUserSchema = z.object({
    id: z.uuid()
})

export type DeleteUserDTO = z.infer<typeof DeleteUserSchema>

export interface DeleteUserResponseDTO {
    id: string
    status: string
    deletedAt: Date
}