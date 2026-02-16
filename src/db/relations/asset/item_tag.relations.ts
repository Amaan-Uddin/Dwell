import { relations } from "drizzle-orm"
import { item } from "@/db/schema/asset/item"
import { tag } from "@/db/schema/asset/tag"
import { item_tag } from "@/db/schema/asset/item_tag.junction"

export const item_tag_relations = relations(item_tag, ({ one }) => ({
    item: one(item, {
        fields: [item_tag.itemId],
        references: [item.id]
    }),
    tag: one(tag, {
        fields: [item_tag.tagId],
        references: [tag.id]
    })
})) 