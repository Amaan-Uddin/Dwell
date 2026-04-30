import { z } from "zod"

export const DeleteUserSchema = z.object({
    id: z.uuid()
})

export type DeleteUserDTO = z.infer<typeof DeleteUserSchema>