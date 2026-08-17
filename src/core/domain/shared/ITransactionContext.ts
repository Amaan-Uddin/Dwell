import { IInventoryRepository } from "../asset/repository/IInventoryRepository";
import { IItemRepository } from "../asset/repository/IItemRepository";
import { IUserRepository } from "../auth/repositories/IUserRepository";
import { IHouseRepository } from "../housing/repositories/IHouseRepository";
import { IResidentRepository } from "../housing/repositories/IResidentRepository";

export interface ITransactionContext {
    houseRepo: IHouseRepository
    residentRepo: IResidentRepository
    userRepo: IUserRepository
    inventoryRepo: IInventoryRepository
    itemRepo: IItemRepository
}