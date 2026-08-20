import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { JoinHouseDTO } from "../../dtos/resident/JoinHouseDTO"
import { Resident, ResidentRole } from "@/core/domain/housing/entities/Resident"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { assertRequireParam } from "../../shared/guards/global"
import { assertHouseExists, assertHouseIsNotArchived } from "../../shared/guards/housing"
import { assertUserExists, assertUserIsNotDeleted, assertUserIsNotGuest } from "../../shared/guards/auth"

export class JoinHouse {
    constructor(private houseRepo: IHouseRepository, private userRepo: IUserRepository, private uow: IUnitOfWork) { }

    async execute(dto: JoinHouseDTO): Promise<void> {
        // check the dto arguments
        assertRequireParam(dto.userId, "User ID")
        assertRequireParam(dto.houseId, "House ID")

        // check to see if the user exist and whether or not their status is ACTIVE and they are not GUEST
        const user = await this.userRepo.findById({ id: dto.userId })
        assertUserExists(user)
        assertUserIsNotDeleted(user)
        assertUserIsNotGuest(user)

        const house = await this.houseRepo.findById({ id: dto.houseId })
        assertHouseExists(house)
        assertHouseIsNotArchived(house)

        await this.uow.execute(async ({ houseRepo, residentRepo }) => {
            // check for a resident record in db which links to the userId and houseId and lock it in place to disallow multiple same requests
            let resident = await residentRepo.findByUserAndHouseId({ userId: user.id, houseId: house.id, forUpdate: true })
            if (resident?.isActive()) {
                // if the resident is active, it mean's they are already in the house and they shouldn't be able to perform this operation of joining again.
                throw new Error("User is already a resident of this house.", { cause: "ALREADY_RESIDENT" })
            }
            if (!resident) {
                resident = Resident.create({ userId: user.id, houseId: house.id, role: ResidentRole.MEMBER })
            }

            if (house.isAbandoned()) {
                house.updateStatusToActive()
                house.transferOwnership(resident.userId)
                resident.promoteToOwner()
                await houseRepo.save({ house })
            }

            if (!resident.isActive()) {
                resident.rejoin()
            }

            await residentRepo.save({ resident })

        })
    }
}