import { relations } from "drizzle-orm"
import { inventory } from "@/db/schema/asset/inventory"
import { item } from "@/db/schema/asset/item"
import { tag } from "@/db/schema/asset/tag"
import { house } from "@/db/schema/housing/house"
import { audit } from "@/db/schema/system/audit"

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
    items: many(item),
    tags: many(tag),
    house: one(house, {
        fields: [inventory.houseId],
        references: [house.id]
    }),
    audits: many(audit)
}))