import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { LeaveHouseDTO } from "../../dtos/resident/LeaveHouseDTO"
import { assertRequireParam } from "../../shared/guards/global"
import { assertHouseIsOperable, assertResidentBelongsToHouse, assertResidentExists, assertResidentIsActive } from "../../shared/guards/housing"

export class LeaveHouse {
    constructor(private uow: IUnitOfWork) { }

    async execute(dto: LeaveHouseDTO): Promise<void> {
        assertRequireParam(dto.residentId, "Resident ID")
        assertRequireParam(dto.houseId, "House ID")

        await this.uow.execute(async ({ residentRepo, houseRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            assertHouseIsOperable(house)

            const resident = await residentRepo.findById({ id: dto.residentId })
            assertResidentExists(resident)
            assertResidentBelongsToHouse(resident, house)
            assertResidentIsActive(resident)

            // with this resident count we can make sure that if there are more then 1 active resident the owner must transfer ownership before leaving
            let residentCount = await residentRepo.findResidentCount({ houseId: house.id })
            if (resident.isOwner() && residentCount > 1) {
                // if only the owner is left , then they can leave the house
                throw new Error("Owner must transfer ownership before leaving the house.", { cause: "OWNER_CANNOT_LEAVE" })
            }

            resident.leave()
            await residentRepo.save({ resident })

            // after successful save the resident count reduces by 1
            residentCount--
            if (!residentCount) {
                house.updateStatusToAbandoned()
                await houseRepo.save({ house })
            }
        })
    }
}