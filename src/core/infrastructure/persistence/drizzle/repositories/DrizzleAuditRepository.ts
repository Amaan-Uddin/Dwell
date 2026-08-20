import { Audit, AuditActionType } from "@/core/domain/system/entities/audit"
import { IAuditRepository } from "@/core/domain/system/repositories/IAuditRepository"
import { Database } from "@/db"
import { AuditSelectType, audit as AuditTb } from "@/db/schema/system/audit"
import { drizzleErrorLogger } from "../utils"
import { and, eq, gt } from "drizzle-orm"

export class DrizzleAuditRepository implements IAuditRepository {
    private readonly MAX_LIMIT = 20
    constructor(private readonly db: Database) { }

    async save({ audit }: { audit: Audit }): Promise<Audit> {
        const db_row = this.toPersistence(audit)
        try {
            const [row] = await this.db.insert(AuditTb).values(db_row).returning()
            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save" })
            throw new Error("Failed to save audit to db.", { cause: error })
        }

    }
    async findById({ id }: { id: string }): Promise<Audit | null> {
        if (!id.trim()) throw new Error("Cannot find audit without an ID.")
        try {
            const [row] = await this.db.select().from(AuditTb).where(eq(AuditTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById" })
            throw new Error(`Failed to fetch audit with ID=${id}`, { cause: error })
        }
    }
    async findByInventoryId({ inventoryId, limit, cursor }: { inventoryId: string, limit?: number, cursor?: number }): Promise<Audit[]> {
        if (!inventoryId.trim()) throw new Error("Cannot find audit without an inventory ID.")
        try {
            const rows = await this.db
                .select()
                .from(AuditTb)
                .where(and(eq(AuditTb.inventoryId, inventoryId), cursor ? gt(AuditTb.eventNumber, cursor) : undefined))
                .limit(limit ?? this.MAX_LIMIT)

            return rows.map(audit => this.toDomain(audit))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByInventoryId" })
            throw new Error(`Failed to fetch audit with Inventory ID=${inventoryId}`, { cause: error })
        }
    }
    async findByItemId({ itemId, limit, cursor }: { itemId: string, limit?: number, cursor?: number }): Promise<Audit[]> {
        if (!itemId.trim()) throw new Error("Cannot find audit without an item ID.")
        try {
            const rows = await this.db
                .select()
                .from(AuditTb)
                .where(and(eq(AuditTb.itemId, itemId), cursor ? gt(AuditTb.eventNumber, cursor) : undefined))
                .limit(limit ?? this.MAX_LIMIT)

            return rows.map(audit => this.toDomain(audit))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByItemId" })
            throw new Error(`Failed to fetch audit with Item ID=${itemId}`, { cause: error })
        }
    }

    private toDomain(db_audit: AuditSelectType): Audit {
        if (!Object.values(AuditActionType).includes(db_audit.actionType as AuditActionType)) {
            throw new Error(`Database corruption detected. Invalid action type: ${db_audit.actionType}`)
        }
        return Audit.reconstitute({
            id: db_audit.id,
            eventNumber: db_audit.eventNumber,
            residentId: db_audit.residentId,
            itemId: db_audit.itemId,
            inventoryId: db_audit.inventoryId,
            actionType: db_audit.actionType as AuditActionType,
            delta: db_audit.delta,
            metadata: db_audit.metadata,
            createdAt: db_audit.createdAt
        })
    }

    private toPersistence(audit: Audit): Omit<AuditSelectType, "eventNumber"> {
        const auditObj = audit.toObject()
        return {
            id: auditObj.id,
            residentId: auditObj.residentId,
            itemId: auditObj.itemId,
            inventoryId: auditObj.inventoryId,
            actionType: auditObj.actionType,
            delta: auditObj.delta,
            metadata: auditObj.metadata,
            createdAt: auditObj.createdAt,
        }
    }
}