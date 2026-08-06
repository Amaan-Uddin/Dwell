import { House, HouseStatus } from "../entities/House";

export interface IHouseRepository {
    save(params: { house: House }): Promise<House> // house creation and updates
    findById(params: { id: string, forUpdate?: boolean }): Promise<House | null> // fetching house and house details

    findHouseCount(params: { ownerId: string, forUpdate?: boolean }): Promise<number> // added forUpdate to enable row-locking to find out the count of houses of an user,
    //  preventing race-condition for creating houses if number of houses still under the limit

    // admin queries
    findByOwner(params: { ownerId: string }): Promise<House[]>
    findByStatus(params: { status: HouseStatus }): Promise<House[]>
}