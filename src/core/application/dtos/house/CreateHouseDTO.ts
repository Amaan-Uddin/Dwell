import { z } from "zod"

export const CreateHouseSchema = z.object({
    name: z.string()
        .min(1, "House name must have at least 1 character.")
        .max(30, "House name can have at most 30 characters.")
        .trim(),
    description: z.string().trim().optional(),
})

export type CreateHouseRequest = z.infer<typeof CreateHouseSchema>

export interface CreateHouseDTO extends CreateHouseRequest {
    userId: string
}

export interface CreateHouseResponseDTO {
    id: string
    name: string
    description: string | null
    ownedBy: string
    status: string
    createdAt: Date
    updatedAt: Date
}