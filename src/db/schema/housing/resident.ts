import { integer, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth/user"
import { house } from "./house"
import { housingSchema } from "./schema"

/**
 * ACTIVE - resident is a part of a house
 * LEFT - resident left house, now status is LEFT but records/audits are intact to maintain integrity
 * REMOVED - resident removed by the owner of house, but records/audits are intact to maintain integrity
 */
const residentStatus = housingSchema.enum("resident_status", ["ACTIVE", "LEFT", "REMOVED"])

/**
 * TEMP - remove status for the resident, meta-data indicating user was removed temporarily
 * PERM - resident was removed permanently from the house
 */
const removeStatus = housingSchema.enum("resident_remove_status", ["TEMP", "PERM"])

export const resident = housingSchema.table("resident", {
    id: uuid().primaryKey(),
    userId: uuid().references(() => user.id).notNull(),
    houseId: uuid().references(() => house.id).notNull(),
    status: residentStatus().notNull(),
    rejoinedCount: integer().default(0).notNull(),
    removeStatus: removeStatus(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().notNull(),
    leftAt: timestamp(),
    removedAt: timestamp()
}, (table) => [
    // ensures that the user can only have ONE resident record per house
    uniqueIndex("user_house_index").on(table.userId, table.houseId)
])

export type ResidentSelectType = typeof resident.$inferSelect