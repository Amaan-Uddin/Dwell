import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"
import { JoinHouseDTO } from "../../dtos/resident/JoinHouseDTO"
import { Resident, ResidentRole } from "@/core/domain/housing/entities/Resident"
import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"

export class JoinHouse {
    constructor(private residentRepo: IResidentRepository, private houseRepo: IHouseRepository, private userRepo: IUserRepository, private uow: IUnitOfWork) { }

    async execute(dto: JoinHouseDTO): Promise<void> {
        // check the dto arguments
        if (!dto.houseId.trim()) throw new Error("House ID is required to join that house.")
        if (!dto.userId.trim()) throw new Error("User ID is required to join a house.")

        // check to see if the user exist and whether or not their status is ACTIVE and they are not GUEST
        const user = await this.userRepo.findById(dto.userId)
        if (!user) throw new Error("User does not exist.", { cause: "USER_NOT_FOUND" })
        if (user.isDeleted()) throw new Error("User account is deleted. Reactivate account to use it.", { cause: "USER_DELETED" })
        if (user.isGuest()) throw new Error("Guest users cannot join houses.", { cause: "GUEST_USER" })


        const house = await this.houseRepo.findById({ id: dto.houseId })
        if (!house) throw new Error("House does not exist.", { cause: "HOUSE_NOT_FOUND" })
        if (house.isArchived()) throw new Error("House is archived, and can no longer be joined.", { cause: "HOUSE_ARCHIVED" })

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
                await houseRepo.save({ house })
            }

            if (!resident.isActive()) {
                resident.rejoin()
            }

            await residentRepo.save({ resident })

        })
    }
}