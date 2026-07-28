import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { CreateHouseDTO } from "../../dtos/house/CreateHouse/CreateHouseDTO"
import { CreateHouseResponseDTO } from "../../dtos/house/CreateHouse/CreateHouseResponseDTO"
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { House } from "@/core/domain/housing/entities/House"
import { HouseMapper } from "../../mappers/house/HouseMapper"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { Resident } from "@/core/domain/housing/entities/Resident"

export class CreateHouse {
    constructor(private houseRepo: IHouseRepository, private userRepo: IUserRepository, private uow: IUnitOfWork) { }

    async execute(dto: CreateHouseDTO): Promise<CreateHouseResponseDTO> {
        // validate the userId which we receive from the client
        if (!dto.ownedBy.trim()) {
            throw new Error("Cannot create house without a user.")
        }

        // check if the user exists or not
        const user = await this.userRepo.findById(dto.ownedBy)
        if (!user) {
            throw new Error("User does not exist.", { cause: "USER_NOT_FOUND" })
        }

        // validate the house name
        if (!dto.name.trim()) {
            throw new Error("House name cannot be empty.")
        }

        // check how many houses does the user already own
        const MAX_HOUSE = 5

        // everything inside here runs in ONE transaction
        const savedHouse = await this.uow.execute(async ({ houseRepo, residentRepo }) => {
            const houseCount = await houseRepo.findHouseCountForUpdate(dto.ownedBy)
            if (houseCount >= MAX_HOUSE) {
                throw new Error(`User already has reached the max limit of ${MAX_HOUSE} houses.`, { cause: "MAX_HOUSE_LIMIT" })
            }

            // create a house domain object
            const house = House.create({ name: dto.name, description: dto.description, ownedBy: dto.ownedBy })

            // save the house to our db using the transaction
            const savedHouse = await houseRepo.save(house)

            // we also have to create the house owner resident record and save it
            const resident = Resident.create({ userId: dto.ownedBy, houseId: savedHouse.id })
            await residentRepo.save(resident)

            return savedHouse
        })

        return HouseMapper.toCreateHouseDTO(savedHouse)
    }
}