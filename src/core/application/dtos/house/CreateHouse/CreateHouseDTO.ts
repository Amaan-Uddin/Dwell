import { z } from "zod"

export const CreateHouseSchema = z.object({
    name: z.string()
        .min(1, "House name must have at least 1 character.")
        .max(30, "House name can have at most 30 characters.")
        .trim(),
    description: z.string().trim().optional(),
    ownedBy: z.uuid()
})

export type CreateHouseDTO = z.infer<typeof CreateHouseSchema>
