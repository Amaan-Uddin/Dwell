import { integer, varchar, text, timestamp } from "drizzle-orm/pg-core"
import { housingSchema } from "./schema"
import { user } from "../auth/user"

/**
 * ACTIVE - house has residents
 * ABANDONED - house has no residents
 * ARCHIVED - after the house has been abandoned for quite some time, the house is put under ARCHIVED state and moved to a different storage
 */
const houseStatus = housingSchema.enum("house_status", ["ACTIVE", "ABANDONED", "ARCHIVED"])

export const house = housingSchema.table("house", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 256 }).notNull(),
    description: text(),
    ownedBy: integer().references(() => user.id),
    status: houseStatus().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
})
