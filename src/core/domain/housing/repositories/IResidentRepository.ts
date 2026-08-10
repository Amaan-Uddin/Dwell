import { Resident } from "../entities/Resident";

export interface IResidentRepository {
    save(params: { resident: Resident }): Promise<Resident>
    saveMany(params: { residents: Resident[] }): Promise<Resident[]>
    findById(params: { id: string, forUpdate?: boolean }): Promise<Resident | null>

    // these methods help fetch all the residents in a particular house or resident records of a particular user
    // resident has a 1 to 1 relation with house and user table, so one resident record can only have one house and user record linked to it.
    findByHouseId(params: { houseId: string }): Promise<Resident[]>
    findByUserId(params: { userId: string }): Promise<Resident[]>

    // this method prevents duplicate active residents and is crucial for enforcing the resident rejoin business rule
    findByUserAndHouseId(params: { userId: string, houseId: string, forUpdate?: boolean }): Promise<Resident | null>
    findResidentCount(params: { houseId: string, forUpdate?: boolean }): Promise<number>
}