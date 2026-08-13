import { integer, timestamp, jsonb, bigserial, uuid } from "drizzle-orm/pg-core"
import { systemSchema } from "./schema"
import { item } from "../asset/item"
import { inventory } from "../asset/inventory"
import { resident } from "../housing/resident"

const actionType = systemSchema.enum("action_type", ["ADDED", "CONSUMED", "RECONCILED", "EXPIRED"])

export const audit = systemSchema.table("audit", {
    id: uuid().primaryKey(),
    eventNumber: bigserial({ mode: "number" }).notNull(),
    residentId: uuid().references(() => resident.id).notNull(),
    itemId: uuid().references(() => item.id).notNull(),
    inventoryId: uuid().references(() => inventory.id).notNull(),
    actionType: actionType().notNull(),
    delta: integer().notNull(),
    metadata: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
})