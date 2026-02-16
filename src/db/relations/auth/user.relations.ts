import { relations } from "drizzle-orm"
import { user } from "@/db/schema/auth/user"
import { resident } from "@/db/schema/housing/resident"

export const userRelations = relations(user, ({ many }) => ({
    resident_list: many(resident)
}))