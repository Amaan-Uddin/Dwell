import { integer, timestamp, jsonb, bigserial } from "drizzle-orm/pg-core"
import { systemSchema } from "./schema"
import { user } from "../auth/user"
import { item } from "../asset/item"
import { inventory } from "../asset/inventory"

const auditEvents = systemSchema.enum("audit_events", ["ADDED", "CONSUMED", "RECONCILED", "EXPIRED", "RETURNED"])

export const audit = systemSchema.table("audit", {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    eventNumber: bigserial({ mode: "number" }),
    userId: integer().references(() => user.id).notNull(),
    itemId: integer().references(() => item.id).notNull(),
    inventoryId: integer().references(() => inventory.id).notNull(),
    actionType: auditEvents().notNull(),
    qtyChange: integer().notNull(),
    metadata: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
})