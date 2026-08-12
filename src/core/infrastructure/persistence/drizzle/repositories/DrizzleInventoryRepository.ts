import { Inventory } from "@/core/domain/asset/entities/inventory"
import { IInventoryRepository } from "@/core/domain/asset/repository/IInventoryRepository"
import { Database } from "@/db"
import { InventorySelectType, inventory as InventoryTb } from "@/db/schema/asset/inventory"
import { drizzleErrorLogger } from "../utils"
import { eq } from "drizzle-orm"

export class DrizzleInventoryRepository implements IInventoryRepository {
    constructor(private readonly db: Database) { }

    async save({ inventory }: { inventory: Inventory }): Promise<Inventory> {
        const db_row = this.toPersistence(inventory)
        try {
            const [row] = await this.db.insert(InventoryTb).values(db_row).onConflictDoUpdate({
                target: InventoryTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()

            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save" })
            throw new Error("Failed to save inventory data to db.", { cause: error })
        }
    }

    async findById({ id }: { id: string }): Promise<Inventory | null> {
        if (!id.trim()) throw new Error("Cannot find inventory without ID.")
        try {
            const [row] = await this.db.select().from(InventoryTb).where(eq(InventoryTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById" })
            throw new Error(`Failed to fetch inventory by ID=${id}`, { cause: error })
        }
    }

    async findByHouseId({ houseId }: { houseId: string }): Promise<Inventory | null> {
        if (!houseId.trim()) throw new Error("Cannot find inventory without house ID.")
        try {
            const [row] = await this.db.select().from(InventoryTb).where(eq(InventoryTb.houseId, houseId))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByHouseId" })
            throw new Error(`Failed to fetch inventory by house ID=${houseId}`, { cause: error })
        }
    }

    private toDomain(db_inventory: InventorySelectType): Inventory {
        return Inventory.reconstitute({
            id: db_inventory.id,
            houseId: db_inventory.houseId,
            createdAt: db_inventory.createdAt,
            updatedAt: db_inventory.updatedAt
        })
    }

    private toPersistence(inventory: Inventory): InventorySelectType {
        return inventory.toObject()
    }
}