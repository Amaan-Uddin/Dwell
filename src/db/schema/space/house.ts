import { pgSchema, integer, varchar, text, } from "drizzle-orm/pg-core"
import { timestamps } from "../../utils/columns.helpers"

export const spaceSchema = pgSchema("space")

export const house = spaceSchema.table("house", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 60 }).notNull(),
    description: text(),
    ...timestamps
})
