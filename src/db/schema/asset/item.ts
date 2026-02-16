import { integer, varchar, timestamp } from "drizzle-orm/pg-core"
import { assetSchema } from ".."
import { inventory } from "./inventory"
import { tag } from "./tag"

export const item = assetSchema.table("item", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 64 }).notNull(),
    inventoryId: integer().references(() => inventory.id),
    tagId: varchar({ length: 256 }).references(() => tag.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
})