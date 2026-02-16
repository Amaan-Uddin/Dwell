import { integer, timestamp } from "drizzle-orm/pg-core"
import { user } from "../auth/user"
import { house } from "./house"
import { housingSchema } from ".."

const residentRoles = housingSchema.enum("resident_roles", ["OWNER", "MEMBER"])

/**
 * ACTIVE - resident is a part of a house
 * LEFT - resident left house, now status is LEFT but records/audits are intact to maintain integrity
 * REMOVED - resident removed by the owner of house, but records/audits are intact to maintain integrity
 */
const residentStatus = housingSchema.enum("resident_status", ["ACTIVE", "LEFT", "REMOVED"])

export const resident = housingSchema.table("resident", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().references(() => user.id).notNull(),
    houseId: integer().references(() => house.id).notNull(),
    status: residentStatus().notNull(),
    role: residentRoles().notNull(),
    leftAt: timestamp(),
    removedAt: timestamp(),
    rejoinedCount: integer().default(0).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
})