import { relations } from "drizzle-orm"
import { resident } from "@/db/schema/housing/resident"
import { house } from "@/db/schema/housing/house"

export const residentRelations = relations(resident, ({ one }) => ({
    house: one(house, {
        fields: [resident.houseId],
        references: [house.id]
    })
}))
