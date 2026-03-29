import { sql, SQL } from "drizzle-orm"
import { integer, varchar, uniqueIndex, AnyPgColumn, timestamp } from "drizzle-orm/pg-core"
import { authSchema } from ".."

/**
 * ACTIVE - user account is active and in use
 * DELETED - soft delete, user record is not deleted but the status is now set as delete
 */
const userStatus = authSchema.enum("user_status", ["ACTIVE", "DELETED"])

const userRoles = authSchema.enum("user_roles", ["ADMIN", "USER", "GUEST"])

export const user = authSchema.table("user", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar({ length: 30 }).notNull(),
    lastName: varchar({ length: 30 }),
    fullName: varchar({ length: 60 })
        .generatedAlwaysAs(
            (): SQL => sql`${user.firstName} || ' ' || ${user.lastName}`
        ).notNull(), // using the generatedAlwaysAs method with a callback to allow us to reference columns from our table to generate the full_name column
    email: varchar({ length: 254 }).notNull(), // we are considering the the local name to be max 64 characters long and the domain address to be max 255 characters and including `@`, total length should be less than 254 as per (RFC 5321 std)
    password: varchar({ length: 256 }),
    externalAuthId: varchar(),
    status: userStatus().notNull(),
    role: userRoles().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
    deletedAt: timestamp(),
}, (table) => [
    uniqueIndex("emailUniqueIndex").on(lower(table.email))
])

export function lower(email: AnyPgColumn): SQL {
    return sql`lower(${email})`
}