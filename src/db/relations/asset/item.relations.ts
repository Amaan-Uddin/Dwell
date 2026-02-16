import { relations } from "drizzle-orm"
import { item } from "@/db/schema/asset/item"
import { inventory } from "@/db/schema/asset/inventory"

export const itemRelations = relations(item, ({ one }) => ({
    inventory: one(inventory, {
        fields: [item.inventoryId],
        references: [inventory.id]
    })
}))