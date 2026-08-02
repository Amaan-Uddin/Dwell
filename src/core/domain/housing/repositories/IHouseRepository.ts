import { House, HouseStatus } from "../entities/House";

export interface IHouseRepository {
    save(house: House): Promise<House> // house creation and updates
    findById(id: string): Promise<House | null> // fetching house and house details
    findByIdForUpdate(id: string): Promise<House | null>

    findHouseCount(ownerId: string): Promise<number>
    findHouseCountForUpdate(ownerId: string): Promise<number> // a row-locking method to find out the count of houses of an user,
    //  preventing race-condition for creating houses if number of houses still under the limit

    // admin queries
    findByOwner(ownerId: string): Promise<House[]>
    findByStatus(status: HouseStatus): Promise<House[]>
}