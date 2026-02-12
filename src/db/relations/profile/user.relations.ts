import { relations } from "drizzle-orm"
import { resident } from "@/db/schema/profile/resident"
import { user } from "@/db/schema/profile/user"

export const userRelation = relations(user, ({ one }) => ({
    resident: one(resident, {
        fields: [user.id],
        references: [resident.userId]
    })
}))