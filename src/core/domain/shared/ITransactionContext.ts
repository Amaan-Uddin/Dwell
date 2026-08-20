import { IInventoryRepository } from "../asset/repository/IInventoryRepository";
import { IItemRepository } from "../asset/repository/IItemRepository";
import { IUserRepository } from "../auth/repositories/IUserRepository";
import { IHouseRepository } from "../housing/repositories/IHouseRepository";
import { IResidentRepository } from "../housing/repositories/IResidentRepository";
import { IAuditRepository } from "../system/repositories/IAuditRepository";

export interface ITransactionContext {
    houseRepo: IHouseRepository
    residentRepo: IResidentRepository
    userRepo: IUserRepository
    inventoryRepo: IInventoryRepository
    itemRepo: IItemRepository
    auditRepo: IAuditRepository
}