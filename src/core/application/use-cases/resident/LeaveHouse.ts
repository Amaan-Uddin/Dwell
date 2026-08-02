import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { LeaveHouseDTO } from "../../dtos/resident/LeaveHouse/LeaveHouseDTO"
import { ResidentRole } from "@/core/domain/housing/entities/Resident"

export class LeaveHouse {
    constructor(
        private residentRepo: IResidentRepository,
        private houseRepo: IHouseRepository,
        private uow: IUnitOfWork) { }

    async execute(dto: LeaveHouseDTO): Promise<void> {

        if (!dto.residentId.trim()) {
            throw new Error("Resident ID is required for this operation.")
        }

        if (!dto.houseId.trim()) {
            throw new Error("House ID is required for this operation.")
        }

        const resident = await this.residentRepo.findById(dto.residentId)
        if (!resident) throw new Error("Resident not found.", { cause: "RESIDENT_NOT_FOUND" })
        if (!resident.isActive()) throw new Error("Resident is currently not in house.", { cause: "RESIDENT_INACTIVE" })
        if (resident.role === ResidentRole.OWNER) {
            throw new Error("Owner must transfer ownership before leaving the house.", { cause: "OWNER_CANNOT_LEAVE" })
        }

        const house = await this.houseRepo.findById(dto.houseId)
        if (!house) throw new Error("House not found.", { cause: "HOUSE_NOT_FOUND" })
        if (!house.isActive()) throw new Error("House is currently in-active or has no members.", { cause: "HOUSE_INACTIVE" })

        await this.uow.execute(async ({ residentRepo, houseRepo }) => {
            resident.leave()
            await residentRepo.save(resident)

            const activeResidentsCount = await residentRepo.findResidentCountForUpdate(house.id)
            if (!activeResidentsCount) {
                house.updateStatusToAbandoned()
                await houseRepo.save(house)
            }
        })
    }
}