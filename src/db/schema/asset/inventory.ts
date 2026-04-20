import { integer, timestamp } from "drizzle-orm/pg-core"
import { house } from "../housing/house"
import { assetSchema } from "./schema"

export const inventory = assetSchema.table("inventory", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    houseId: integer().references(() => house.id).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
})