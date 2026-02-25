import { relations } from "drizzle-orm"
import { resident } from "@/db/schema/housing/resident"
import { house } from "@/db/schema/housing/house"
import { user } from "@/db/schema/auth/user"

export const residentRelations = relations(resident, ({ one }) => ({
    house: one(house, {
        fields: [resident.houseId],
        references: [house.id]
    }),
    user: one(user, {
        fields: [resident.userId],
        references: [user.id]
    })
}))
