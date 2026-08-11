import { integer, varchar, timestamp, uuid } from "drizzle-orm/pg-core"
import { assetSchema } from "./schema"
import { inventory } from "./inventory"

export const itemStatus = assetSchema.enum("item_status", ["ACTIVE", "ARCHIVED"])

export const item = assetSchema.table("item", {
    id: uuid().primaryKey(),
    name: varchar({ length: 64 }).notNull(),
    status: itemStatus().notNull(),
    count: integer().default(0).notNull(),
    inventoryId: uuid().references(() => inventory.id).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().notNull()
})

export type ItemSelectType = typeof item.$inferSelect