import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"
import { ChangeOwnershipDTO } from "../../dtos/house/ChangeOwnershipDTO"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"

export class ChangeOwnership {
    constructor(private houseRepo: IHouseRepository, private residentRepo: IResidentRepository, private uow: IUnitOfWork) { }
    async execute(dto: ChangeOwnershipDTO): Promise<void> {
        if (!dto.houseId.trim()) throw new Error("House ID is required for this operation.")
        if (!dto.currentOwnerId.trim()) throw new Error("Current owner's resident id is required for this operation")
        if (!dto.newOwnerId.trim()) throw new Error("New owner's resident ID is required for this operation.")

        await this.uow.execute(async ({ houseRepo, residentRepo }) => {
            const house = await houseRepo.findById({ id: dto.houseId, forUpdate: true })
            if (!house) throw new Error("House not found.", { cause: "HOUSE_NOT_FOUND" })
            if (house.isArchived()) throw new Error("House is archived and cannot be transferred.", { cause: "HOUSE_ARCHIVED" })
            if (house.isAbandoned()) throw new Error("House is abandoned and has no active residents to transfer ownership to.", { cause: "HOUSE_ABANDONED" })

            const newOwner = await residentRepo.findById({ id: dto.newOwnerId })
            if (!newOwner) throw new Error("Resident not found.", { cause: "RESIDENT_NOT_FOUND" })
            if (newOwner.houseId !== house.id) throw new Error("Resident does not belong to this house.", { cause: "RESIDENT_HOUSE_MISMATCH" })
            if (!newOwner.isActive()) throw new Error("New owner must be an active resident.", { cause: "RESIDENT_INACTIVE" })

            const currentOwner = await residentRepo.findByUserAndHouseId({ userId: house.ownedBy, houseId: house.id })
            if (!currentOwner) throw new Error("Current owner resident record not found.", { cause: "OWNER_NOT_FOUND" })
            if (currentOwner.id === newOwner.id) throw new Error("This resident is already the owner.", { cause: "ALREADY_OWNER" })

            const [first, second] = [currentOwner, newOwner].sort((a, b) => a.id.localeCompare(b.id))
            await residentRepo.findById({ id: first.id, forUpdate: true })
            await residentRepo.findById({ id: second.id, forUpdate: true })

            house.transferOwnership(newOwner.id)
            currentOwner.demoteToMember()
            newOwner.promoteToOwner()

            await houseRepo.save({ house })
            await residentRepo.save({ resident: currentOwner })
            await residentRepo.save({ resident: newOwner })
        })
    }
}