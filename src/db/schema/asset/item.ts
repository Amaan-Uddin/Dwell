import { integer, varchar, timestamp } from "drizzle-orm/pg-core"
import { assetSchema } from "./schema"
import { inventory } from "./inventory"

export const item = assetSchema.table("item", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 64 }).notNull(),
    inventoryId: integer().references(() => inventory.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
})