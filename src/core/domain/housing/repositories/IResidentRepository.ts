import { Resident } from "../entities/Resident";

export interface IResidentRepository {
    save(resident: Resident): Promise<Resident>
    findById(id: string): Promise<Resident | null>

    // these methods help fetch all the residents in a particular house or resident records of a particular user
    // resident has a 1 to 1 relation with house and user table, so one resident record can only have one house and user record linked to it.
    findByHouseId(houseId: string): Promise<Resident[]>
    findByUserId(userId: string): Promise<Resident[]>

    // this method prevents duplicate active residents and is crucial for enforcing the resident rejoin business rule
    findByUserAndHouseId(userId: string, houseId: string): Promise<Resident | null>
    findByUserAndHouseIdForUpdate(userId: string, houseId: string): Promise<Resident | null> // row-locked method
}