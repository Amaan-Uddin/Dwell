import { IHouseRepository } from "../housing/repositories/IHouseRepository";
import { IResidentRepository } from "../housing/repositories/IResidentRepository";

export interface ITransactionContext {
    houseRepo: IHouseRepository
    residentRepo: IResidentRepository
}