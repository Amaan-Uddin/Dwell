import { z } from "zod"

export const RemoveResidentSchema = z.object({
    targetResidentsId: z.array(z.uuid().min(1).max(30)),
    removalType: z.enum(["TEMP", "PERM"]).default("TEMP")
})

export type RemoveResidentRequest = z.infer<typeof RemoveResidentSchema>

export interface RemoveResidentDTO extends RemoveResidentRequest {
    houseId: string
    actingUserId: string
}