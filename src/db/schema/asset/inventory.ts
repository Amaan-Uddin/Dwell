import { timestamp, uuid } from "drizzle-orm/pg-core"
import { house } from "../housing/house"
import { assetSchema } from "./schema"

export const inventory = assetSchema.table("inventory", {
    id: uuid().primaryKey(),
    houseId: uuid().references(() => house.id).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
})

export type InventorySelectType = typeof inventory.$inferSelect