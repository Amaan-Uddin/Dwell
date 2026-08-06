import { z } from "zod"

export const ChangeOwnershipSchema = z.object({
    houseId: z.uuid(),
    currentOwnerId: z.uuid(),
    newOwnerId: z.uuid(),
})

export type ChangeOwnershipDTO = z.infer<typeof ChangeOwnershipSchema>
