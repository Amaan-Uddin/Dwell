import { varchar, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { housingSchema } from "./schema"
import { user } from "../auth/user"

/**
 * ACTIVE - house has residents
 * ABANDONED - house has no residents
 * ARCHIVED - after the house has been abandoned for quite some time, the house is put under ARCHIVED state and moved to a different storage
 */
const houseStatus = housingSchema.enum("house_status", ["ACTIVE", "ABANDONED", "ARCHIVED"])

export const house = housingSchema.table("house", {
    id: uuid().primaryKey(),
    name: varchar({ length: 256 }).notNull(),
    description: text(),
    ownedBy: uuid().references(() => user.id).notNull(),
    status: houseStatus().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
})
