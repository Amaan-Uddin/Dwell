import { relations } from "drizzle-orm"
import { item } from "@/db/schema/asset/item"
import { inventory } from "@/db/schema/asset/inventory"
import { item_tag } from "@/db/schema/asset/item_tag.junction"

export const itemRelations = relations(item, ({ one, many }) => ({
    inventory: one(inventory, {
        fields: [item.inventoryId],
        references: [inventory.id]
    }),
    itemToTags: many(item_tag)
}))