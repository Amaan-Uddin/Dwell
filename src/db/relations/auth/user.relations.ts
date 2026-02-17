import { relations } from "drizzle-orm"
import { user } from "@/db/schema/auth/user"
import { resident } from "@/db/schema/housing/resident"
import { house } from "@/db/schema/housing/house"

export const userRelations = relations(user, ({ many }) => ({
    resident_list: many(resident), // this field holds a list resident id which the user has (i.e. which all houses is the user a resident of)
    house_list: many(house)
}))