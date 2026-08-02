import { z } from "zod"

export const LeaveHouseSchema = z.object({
    residentId: z.uuid(),
    houseId: z.uuid()
})

export type LeaveHouseDTO = z.infer<typeof LeaveHouseSchema>