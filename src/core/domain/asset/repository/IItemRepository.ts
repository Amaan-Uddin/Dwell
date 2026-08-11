import { Item } from "../entities/item"

export interface IItemRepository {
    save(params: { item: Item }): Promise<Item>
    findById(params: { id: string }): Promise<Item | null>

    findByInventory(params: { inventoryId: string }): Promise<Item[] | null>
}