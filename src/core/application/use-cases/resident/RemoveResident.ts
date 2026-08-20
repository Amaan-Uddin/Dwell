import { RemoveStatus, Resident } from "@/core/domain/housing/entities/Resident"
import { RemoveResidentDTO } from "../../dtos/resident/RemoveResidentDTO"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { assertRequireParam } from "../../shared/guards/global"
import { assertHouseIsOperable, assertResidentBelongsToHouse, assertResidentExists } from "../../shared/guards/housing"

export class RemoveResident {
    constructor(private uow: IUnitOfWork) { }

    async execute(dto: RemoveResidentDTO): Promise<void> {
        assertRequireParam(dto.houseId, "House ID")
        if (dto.targetResidentsId.length == 0) throw new Error("At least one resident ID is required for this operation.")

        await this.uow.execute(async ({ residentRepo, houseRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            assertHouseIsOperable(house)

            const actingResident = await residentRepo.findByUserAndHouseId({ userId: dto.actingUserId, houseId: house.id })
            assertResidentExists(actingResident)
            if (!actingResident || !actingResident.isOwner()) {
                throw new Error("Only owner of house can remove residents.", { cause: "NOT_AUTHORIZED" })
            }

            if (dto.targetResidentsId.includes(actingResident.id)) {
                throw new Error("Owner cannot remove themselves, they must leave.", { cause: "CANNOT_REMOVE_SELF" })
            }

            const sortedIds = [...new Set(dto.targetResidentsId)].sort((a, b) => a.localeCompare(b))

            const targets: Resident[] = []
            for (const id of sortedIds) {
                const resident = await residentRepo.findById({ id, forUpdate: true })
                assertResidentExists(resident)
                assertResidentBelongsToHouse(resident, house)
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