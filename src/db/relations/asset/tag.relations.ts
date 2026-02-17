import { relations } from "drizzle-orm"
import { tag } from "@/db/schema/asset/tag"
import { inventory } from "@/db/schema/asset/inventory"
import { item_tag } from "@/db/schema/asset/item_tag.junction"

export const tagRelations = relations(tag, ({ one, many }) => ({
    inventory: one(inventory, {
        fields: [tag.inventoryId],
        references: [inventory.id]
    }),
    itemToTags: many(item_tag)
}))