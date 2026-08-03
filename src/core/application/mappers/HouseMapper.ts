import { House } from "@/core/domain/housing/entities/House"
import { CreateHouseResponseDTO } from "../dtos/house/CreateHouseDTO"

export class HouseMapper {
    static toCreateHouseDTO(house: House): CreateHouseResponseDTO {
        return {
            id: house.id,
            name: house.name,
            description: house.description,
            ownedBy: house.ownedBy,
            status: house.status,
            createdAt: house.createdAt,
            updatedAt: house.updatedAt
        }
    }
}