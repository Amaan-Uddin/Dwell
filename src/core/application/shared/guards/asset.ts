import { Inventory } from "@/core/domain/asset/entities/inventory"
import { Item } from "@/core/domain/asset/entities/item"

export function assertInventoryExists(inventory: Inventory | null): asserts inventory is Inventory {
    if (!inventory) throw new Error("Inventory not found for house.", { cause: "INVENTORY_NOT_FOUND" })
}

export function assertItemExists(item: Item | null): asserts item is Item {
    if (!item) throw new Error("Item not found.", { cause: "ITEM_NOT_FOUND" })
}

export function assertItemBelongsToInventory(item: Item, inventory: Inventory): void {
    if (item.inventoryId !== inventory.id) throw new Error("Item does not belong to the house's inventory.", { cause: "ITEM_INVENTORY_MISMATCH" })
}

export function assertItemNotArchived(item: Item): void {
    if (item.isArchived()) throw new Error(`Item ${item.name} is archived, restore it before continuing further.`, { cause: "ITEM_ARCHIVED" })
}