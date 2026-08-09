import { z } from "zod"

export const LeaveHouseSchema = z.object({
    residentId: z.uuid(),
})

export type LeaveHouseRequest = z.infer<typeof LeaveHouseSchema>

export interface LeaveHouseDTO extends LeaveHouseRequest {
    houseId: string
}