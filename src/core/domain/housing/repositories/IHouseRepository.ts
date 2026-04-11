import { House, HouseStatus } from "../entities/House";

export interface IHouseRepository {
    save(house: House): Promise<House>
    findById(id: string): Promise<House | null>

    findByOwner(ownerId: string): Promise<House[]>
    findByStatus(status: HouseStatus): Promise<House[]>
}