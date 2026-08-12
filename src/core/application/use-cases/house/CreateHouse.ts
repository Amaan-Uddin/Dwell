import { CreateHouseDTO, CreateHouseResponseDTO } from "../../dtos/house/CreateHouseDTO"
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { House } from "@/core/domain/housing/entities/House"
import { HouseMapper } from "../../mappers/HouseMapper"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { Resident, ResidentRole } from "@/core/domain/housing/entities/Resident"
import { Inventory } from "@/core/domain/asset/entities/inventory"

export class CreateHouse {
    constructor(private userRepo: IUserRepository, private uow: IUnitOfWork) { }

    async execute(dto: CreateHouseDTO): Promise<CreateHouseResponseDTO> {
        // validate the userId which we receive from the client
        if (!dto.userId.trim()) {
            throw new Error("Cannot create house without a user.")
        }

        // check if the user exists or not
        const user = await this.userRepo.findById(dto.userId)
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
        const savedHouse = await this.uow.execute(async ({ houseRepo, residentRepo, inventoryRepo }) => {
            const houseCount = await houseRepo.findHouseCount({ ownerId: dto.userId, forUpdate: true })
            if (houseCount >= MAX_HOUSE) {
                throw new Error(`User already has reached the max limit of ${MAX_HOUSE} houses.`, { cause: "MAX_HOUSE_LIMIT" })
            }

            // create a house object and an inventory object for the house, and save them to the db
            const house = House.create({ name: dto.name, description: dto.description, ownedBy: dto.userId })
            const inventory = Inventory.create({ houseId: house.id })

            // save the house to our db using the transaction
            const savedHouse = await houseRepo.save({ house })

            // save the inventory to our db using the transaction
            await inventoryRepo.save({ inventory })

            // we also have to create the house owner resident record and save it
            const resident = Resident.create({ userId: dto.userId, houseId: savedHouse.id, role: ResidentRole.OWNER })
            await residentRepo.save({ resident })

            return savedHouse
        })

        return HouseMapper.toCreateHouseDTO(savedHouse)
    }
}