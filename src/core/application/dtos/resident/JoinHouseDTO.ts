import { z } from "zod"

export const JoinHouseSchema = z.object({
    houseId: z.uuid(),
    userId: z.uuid()
})

export type JoinHouseDTO = z.infer<typeof JoinHouseSchema>