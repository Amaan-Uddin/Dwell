import { relations } from "drizzle-orm"
import { audit } from "@/db/schema/system/audit"
import { item } from "@/db/schema/asset/item"
import { inventory } from "@/db/schema/asset/inventory"
import { resident } from "@/db/schema/housing/resident"

export const auditRelations = relations(audit, ({ one }) => ({
    item: one(item, {
        fields: [audit.itemId],
        references: [item.id]
    }),
    resident: one(resident, {
        fields: [audit.residentId],
        references: [resident.id]
    }),
    inventory: one(inventory, {
        fields: [audit.inventoryId],
        references: [inventory.id]
    })
}))