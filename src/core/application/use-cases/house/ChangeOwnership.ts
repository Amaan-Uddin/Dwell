import { ChangeOwnershipDTO } from "../../dtos/house/ChangeOwnershipDTO"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { assertRequireParam } from "../../shared/guards/global"
import { assertHouseIsOperable, assertResidentBelongsToHouse, assertResidentExists, assertResidentIsActive } from "../../shared/guards/housing"

export class ChangeOwnership {
    constructor(private uow: IUnitOfWork) { }
    async execute(dto: ChangeOwnershipDTO): Promise<void> {
        assertRequireParam(dto.houseId, "House ID")
        assertRequireParam(dto.newOwnerResidentId, "New owner's resident ID")

        await this.uow.execute(async ({ houseRepo, residentRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            assertHouseIsOperable(house)
            if (house.ownedBy !== dto.actingUserId) throw new Error("Only the owner can transfer ownership.", { cause: "NOT_AUTHORIZED" })

            const newOwner = await residentRepo.findById({ id: dto.newOwnerResidentId })
            assertResidentExists(newOwner)
            assertResidentBelongsToHouse(newOwner, house)
            assertResidentIsActive(newOwner)

            const currentOwner = await residentRepo.findByUserAndHouseId({ userId: house.ownedBy, houseId: house.id })
            assertResidentExists(currentOwner)
            if (currentOwner.id === newOwner.id) throw new Error("This resident is already the owner.", { cause: "ALREADY_OWNER" })

            const [first, second] = [currentOwner, newOwner].sort((a, b) => a.id.localeCompare(b.id))
            await residentRepo.findById({ id: first.id, forUpdate: true })
            await residentRepo.findById({ id: second.id, forUpdate: true })

            house.transferOwnership(newOwner.userId)
            currentOwner.demoteToMember()
            newOwner.promoteToOwner()

            await houseRepo.save({ house })
            await residentRepo.save({ resident: currentOwner })
            await residentRepo.save({ resident: newOwner })
        })
    }
}