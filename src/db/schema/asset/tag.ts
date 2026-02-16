import { integer, varchar, timestamp } from "drizzle-orm/pg-core"
import { assetSchema } from ".."
import { inventory } from "./inventory"

export const tag = assetSchema.table("tag", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 256 }).notNull(),
    inventoryId: integer().references(() => inventory.id).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
})