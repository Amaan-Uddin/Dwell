import { House, HouseStatus } from "../entities/House";

export interface IHouseRepository {
    save(house: House): Promise<House> // house creation and updates
    findById(id: string): Promise<House | null> // fetching house and house details

    // admin queries
    findByOwner(ownerId: string): Promise<House[]>
    findByStatus(status: HouseStatus): Promise<House[]>
}