import { sql, SQL } from "drizzle-orm"
import { pgSchema, integer, varchar, uniqueIndex, AnyPgColumn, } from "drizzle-orm/pg-core"
import { timestamps } from "../../utils/columns.helpers"

export const profileSchema = pgSchema("profile")

export const user = profileSchema.table("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar({ length: 30 }).notNull(),
    lastName: varchar({ length: 30 }),
    fullName: varchar({ length: 60 })
        .generatedAlwaysAs(
            (): SQL => sql`${user.firstName} || ' ' || ${user.lastName}`
        ), // using the generatedAlwaysAs method with a callback to allow us to reference columns from our table to generate the full_name column
    email: varchar({ length: 320 }).notNull(), // we are considering the the the email name to be 64 characters long and the address to be 255 characters and including `@` we get total 320 characters
    password: varchar({ length: 255 }),
    ...timestamps
}, (table) => [
    uniqueIndex("emailUniqueIndex").on(lower(table.email))
])

export function lower(email: AnyPgColumn): SQL {
    return sql`lower(${email})`
}