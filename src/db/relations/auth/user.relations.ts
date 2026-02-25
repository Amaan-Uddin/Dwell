import { relations } from "drizzle-orm"
import { user } from "@/db/schema/auth/user"
import { resident } from "@/db/schema/housing/resident"
import { house } from "@/db/schema/housing/house"

export const userRelations = relations(user, ({ many }) => ({
    resident_list: many(resident), // list of resident IDs the user is connected to
    house_list: many(house) // users can create multiple houses, but be in one at a time.
}))