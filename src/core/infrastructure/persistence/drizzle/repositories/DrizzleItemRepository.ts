import { Item, ItemStatus } from "@/core/domain/asset/entities/item"
import { IItemRepository } from "@/core/domain/asset/repository/IItemRepository"
import { Database } from "@/db"
import { ItemSelectType, item as ItemTb } from "@/db/schema/asset/item"
import { drizzleErrorLogger } from "../utils"
import { eq } from "drizzle-orm"

export class DrizzleItemRepository implements IItemRepository {
    constructor(private readonly db: Database) { }
    async save({ item }: { item: Item }): Promise<Item> {
        const db_row = this.toPersistence(item)
        try {
            const [row] = await this.db.insert(ItemTb).values(db_row).onConflictDoUpdate({
                target: ItemTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save" })
            throw new Error("Failed to save item data to db.", { cause: error })
        }
    }
    async findById({ id }: { id: string }): Promise<Item | null> {
        if (!id.trim()) throw new Error("Cannot find item without ID.")
        try {
            const [row] = await this.db.select().from(ItemTb).where(eq(ItemTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById" })
            throw new Error(`Failed to fetch item by ID=${id}`, { cause: error })
        }
    }
    async findByInventory({ inventoryId }: { inventoryId: string }): Promise<Item[] | null> {
        if (!inventoryId.trim()) throw new Error("Cannot find items without inventory ID.")
        try {
            const rows = await this.db.select().from(ItemTb).where(eq(ItemTb.inventoryId, inventoryId))
            return rows.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByInventory" })
            throw new Error(`Failed to fetch items by inventory ID=${inventoryId}`, { cause: error })
        }
    }

    private toDomain(db_item: ItemSelectType): Item {
        if (!Object.keys(ItemStatus).includes(db_item.status)) throw new Error(`Database corruption detected: Invalid item status: ${db_item.status}`)
        return Item.reconstitute({
            id: db_item.id,
            inventoryId: db_item.inventoryId,
            name: db_item.name,
            status: db_item.status as ItemStatus,
            count: db_item.count,
            createdAt: db_item.createdAt,
            updatedAt: db_item.updatedAt
        })
    }

    private toPersistence(item: Item): ItemSelectType {
        return item.toObject()
    }
}