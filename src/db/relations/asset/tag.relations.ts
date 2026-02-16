import { relations } from "drizzle-orm"
import { tag } from "@/db/schema/asset/tag"
import { item } from "@/db/schema/asset/item"
import { inventory } from "@/db/schema/asset/inventory"

export const tagRelations = relations(tag, ({ one, many }) => ({
    items: many(item),
    inventory: one(inventory, {
        fields: [tag.inventoryId],
        references: [inventory.id]
    })
}))