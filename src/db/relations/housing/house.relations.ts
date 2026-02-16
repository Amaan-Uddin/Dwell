import { relations } from "drizzle-orm"
import { house } from "@/db/schema/housing/house"
import { resident } from "@/db/schema/housing/resident"

export const houseRelations = relations(house, ({ many }) => ({
    resident_list: many(resident)
}))