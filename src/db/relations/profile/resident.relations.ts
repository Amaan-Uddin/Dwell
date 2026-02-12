import { relations } from "drizzle-orm"
import { resident } from "@/db/schema/profile/resident"
import { house } from "@/db/schema/space/house"
import { user } from "@/db/schema/profile/user"

export const residentRelation = relations(resident, ({ one }) => ({
    house: one(house, {
        fields: [resident.houseId],
        references: [house.id]
    }),
    user: one(user, {
        fields: [resident.userId],
        references: [user.id]
    })
}))