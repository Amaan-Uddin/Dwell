import { z } from "zod"

export const ChangeOwnershipSchema = z.object({
    newOwnerResidentId: z.uuid(),
})

export type ChangeOwnershipRequest = z.infer<typeof ChangeOwnershipSchema>

export interface ChangeOwnershipDTO extends ChangeOwnershipRequest {
    houseId: string,
    actingUserId: string
}