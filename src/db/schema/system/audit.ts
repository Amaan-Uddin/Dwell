import { integer, timestamp, jsonb, bigserial, uuid, check } from "drizzle-orm/pg-core"
import { systemSchema } from "./schema"
import { item } from "../asset/item"
import { inventory } from "../asset/inventory"
import { resident } from "../housing/resident"
import { AuditMetadata } from "@/core/domain/system/entities/audit"
import { sql } from "drizzle-orm"

const actionType = systemSchema.enum("action_type", ["ADDED", "CONSUMED", "RECONCILED", "EXPIRED"])

export const audit = systemSchema.table("audit", {
    id: uuid().primaryKey(),
    eventNumber: bigserial({ mode: "number" }).notNull(),
    residentId: uuid().references(() => resident.id).notNull(),
    itemId: uuid().references(() => item.id).notNull(),
    inventoryId: uuid().references(() => inventory.id).notNull(),
    actionType: actionType().notNull(),
    delta: integer().notNull(),
    metadata: jsonb().$type<AuditMetadata | null>(),
    createdAt: timestamp().defaultNow().notNull(),
}, (table) => [
    check("delta_not_be_zero", sql`${table.delta} != 0`)
])

export type AuditSelectType = typeof audit.$inferSelect