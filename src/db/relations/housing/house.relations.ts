import { relations } from "drizzle-orm"
import { house } from "@/db/schema/housing/house"
import { resident } from "@/db/schema/housing/resident"
import { user } from "@/db/schema/auth/user"

export const houseRelations = relations(house, ({ one, many }) => ({
    resident_list: many(resident),
    owner: one(user, {
        fields: [house.ownedBy],
        references: [user.id]
    })
}))