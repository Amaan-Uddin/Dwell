import { Inventory } from "../entities/inventory";

export interface IInventoryRepository {
    save(params: { inventory: Inventory }): Promise<Inventory>
    findById(params: { id: string }): Promise<Inventory | null>

    findByHouseId(params: { houseId: string }): Promise<Inventory | null>
}