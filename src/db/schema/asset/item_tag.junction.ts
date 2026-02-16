import { integer, primaryKey } from "drizzle-orm/pg-core"
import { item } from "./item"
import { tag } from "./tag"
import { assetSchema } from ".."

export const item_tag = assetSchema.table("item_to_tag", {
    itemId: integer().references(() => item.id).notNull(),
    tagId: integer().references(() => tag.id).notNull(),

}, (table) => [
    primaryKey({ columns: [table.itemId, table.tagId] })
])