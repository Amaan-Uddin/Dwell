import { relations } from "drizzle-orm"
import { audit } from "@/db/schema/system/audit"
import { item } from "@/db/schema/asset/item"
import { user } from "@/db/schema/auth/user"
import { inventory } from "@/db/schema/asset/inventory"

export const auditRelations = relations(audit, ({ one }) => ({
    item: one(item, {
        fields: [audit.itemId],
        references: [item.id]
    }),
    user: one(user, {
        fields: [audit.userId],
        references: [user.id]
    }),
    inventory: one(inventory, {
        fields: [audit.inventoryId],
        references: [inventory.id]
    })
}))