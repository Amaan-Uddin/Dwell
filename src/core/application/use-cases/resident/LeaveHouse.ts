import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { LeaveHouseDTO } from "../../dtos/resident/LeaveHouseDTO"

export class LeaveHouse {
    constructor(private uow: IUnitOfWork) { }

    async execute(dto: LeaveHouseDTO): Promise<void> {
        if (!dto.residentId.trim()) throw new Error("Resident ID is required for this operation.")
        if (!dto.houseId.trim()) throw new Error("House ID is required for this operation.")

        await this.uow.execute(async ({ residentRepo, houseRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            if (!house) throw new Error("House not found.", { cause: "HOUSE_NOT_FOUND" })
            if (house.isArchived()) throw new Error("House is archived.", { cause: "HOUSE_ARCHIVED" })
            if (house.isAbandoned()) throw new Error("House is abandoned and has no active residents.", { cause: "HOUSE_ABANDONED" })

            const resident = await residentRepo.findById({ id: dto.residentId })
            if (!resident) throw new Error("Resident not found.", { cause: "RESIDENT_NOT_FOUND" })
            if (resident.houseId !== house.id) throw new Error("Resident does not belong to this house.", { cause: "RESIDENT_HOUSE_MISMATCH" })
            if (!resident.isActive()) throw new Error("Resident is not in house.", { cause: "RESIDENT_INACTIVE" })
            if (resident.isOwner()) {
                const residentCount = await residentRepo.findResidentCount({ houseId: house.id })
                // with this resident count we can make sure that if there are more then 1 active resident the owner must transfer ownership before leaving
                // if only the owner is left , then they can leave the house
                if (residentCount > 0) throw new Error("Owner must transfer ownership before leaving the house.", { cause: "OWNER_CANNOT_LEAVE" })
            }

            resident.leave()
            if (resident.isOwner()) {
                resident.demoteToMember()
            }

            await residentRepo.save({ resident })

            const activeResidentsCount = await residentRepo.findResidentCount({ houseId: house.id })
            if (!activeResidentsCount) {
                house.updateStatusToAbandoned()
                await houseRepo.save({ house })
            }
        })
    }
}