import { Audit } from "../entities/audit"

export interface IAuditRepository {
    save(params: { audit: Audit }): Promise<Audit>
    findById(params: { id: string }): Promise<Audit | null>
    findByItemId(params: { itemId: string, limit?: number, cursor?: number }): Promise<Audit[]>
    findByInventoryId(params: { inventoryId: string, limit?: number, cursor?: number }): Promise<Audit[]>

}