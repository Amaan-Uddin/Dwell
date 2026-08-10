import { RemoveStatus, Resident } from "@/core/domain/housing/entities/Resident"
import { RemoveResidentDTO } from "../../dtos/resident/RemoveResidentDTO"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"

export class RemoveResident {
    constructor(private uow: IUnitOfWork) { }

    async execute(dto: RemoveResidentDTO): Promise<void> {
        if (!dto.houseId.trim()) throw new Error("House ID is required for this operation.")
        if (dto.targetResidentsId.length == 0) throw new Error("At least one resident ID is required for this operation.")

        await this.uow.execute(async ({ residentRepo, houseRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            if (!house) throw new Error("House not found.", { cause: "HOUSE_NOT_FOUND" })
            if (house.isArchived()) throw new Error("House is archived, and no operation can be performed on it.", { cause: "HOUSE_ARCHIVED" })
            if (house.isAbandoned()) throw new Error("House is abandoned and has no active residents.", { cause: "HOUSE_ABANDONED" })

            const actingResident = await residentRepo.findByUserAndHouseId({ userId: dto.actingUserId, houseId: house.id })
            if (!actingResident || !actingResident.isOwner()) throw new Error("Only owner of house can remove resident.", { cause: "NOT_AUTHORIZED" })

            if (dto.targetResidentsId.includes(actingResident.id)) {
                throw new Error("Owner cannot remove themselves, they must leave.", { cause: "CANNOT_REMOVE_SELF" })
            }

            const sortedIds = [...new Set(dto.targetResidentsId)].sort((a, b) => a.localeCompare(b))

            const targets: Resident[] = []
            for (const id of sortedIds) {
                const resident = await residentRepo.findById({ id, forUpdate: true })
                if (!resident) throw new Error(`Resident not found: ${id}`, { cause: "RESIDENT_NOT_FOUND" })
                if (resident.houseId !== house.id) throw new Error(`Resident does not belong to this house: ${id}`, { cause: "RESIDENT_HOUSE_MISMATCH" })
                targets.push(resident)
            }

            for (const resident of targets) {
                if (dto.removalType === "TEMP") resident.remove(RemoveStatus.TEMP)
                else if (dto.removalType === "PERM") resident.remove(RemoveStatus.PERM)
                else throw new Error(`Unknown removal type: ${dto.removalType}`, { cause: "INVALID_REMOVAL_TYPE" })
            }

            await residentRepo.saveMany({ residents: targets })
        })
    }
}