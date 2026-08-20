import { Item } from "../entities/item"

export interface IItemRepository {
    save(params: { item: Item }): Promise<Item>
    findById(params: { id: string, forUpdate?: boolean }): Promise<Item | null>

    findByInventory(params: { inventoryId: string }): Promise<Item[] | null>
    findByNameAndInventory(params: { name: string, inventoryId: string, forUpdate?: boolean }): Promise<Item | null>
}