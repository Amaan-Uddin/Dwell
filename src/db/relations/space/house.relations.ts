import { relations } from "drizzle-orm"
import { house } from "@/db/schema/space/house"
import { resident } from "@/db/schema/profile/resident"

export const houseRelation = relations(house, ({ many }) => ({
    residents: many(resident)
}))


