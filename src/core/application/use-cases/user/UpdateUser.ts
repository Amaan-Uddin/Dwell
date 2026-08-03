import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { UpdateUserDetailDTO, UpdateUserEmailDTO } from "../../dtos/user/UpdateUserDTO"
import { UpdateUserResponseDTO } from "../../dtos/user/UpdateUserDTO"
import { IClerkService } from "@/core/infrastructure/auth-services/clerk/IClerkService"
import { UserMapper } from "../../mappers/UserMapper"
import { Email } from "@/core/domain/auth/value-objects/Email"

export class UpdateUser {
    constructor(private userRepo: IUserRepository, private clerkService: IClerkService) { }

    async executeToUpdateDetails(dto: UpdateUserDetailDTO): Promise<UpdateUserResponseDTO> {
        const user = await this.userRepo.findById(dto.id)
        if (!user) throw new Error(`User with ID=${dto.id} does not exist.`)

        const previousData = { firstName: dto.firstName, lastName: dto.lastName ?? undefined }

        user.updateProfile({ firstName: dto.firstName, lastName: dto.lastName })
        const savedUser = await this.userRepo.save(user)

        try {
            await this.clerkService.updateUserFirstAndLastName(savedUser)
        } catch (error) {
            // if the clerk-sync fails, then we implement a rollback
            // NOTE: this gives rise to a dual-write problem which can be resolved with an outbox patten solution
            user.updateProfile(previousData)
            await this.userRepo.save(user)
            throw new Error("Failed to sync changes to clerk, local changes were rollback.", { cause: error })
        }

        return UserMapper.toUpdateUserDTO(savedUser)
    }

    async executeToUpdateEmail(dto: UpdateUserEmailDTO): Promise<UpdateUserResponseDTO> {
        const user = await this.userRepo.findById(dto.id)
        if (!user) throw new Error(`User with ID=${dto.id} does not exist.`)

        const emailTaken = await this.userRepo.findByEmail(dto.email)
        if (emailTaken && emailTaken.id !== dto.id) {
            throw new Error("Email already in use.")
        }

        const previousData = { email: Email.create(dto.email) }

        user.updateEmail({ email: Email.create(dto.email) })
        const savedUser = await this.userRepo.save(user)

        try {
            await this.clerkService.updateUserEmailAddress(savedUser)
        } catch (error) {
            user.updateEmail(previousData)
            await this.userRepo.save(user)
            throw new Error("Failed to sync email to clerk, local changes were rollback.", { cause: error })
        }

        return UserMapper.toUpdateUserDTO(user)
    }

    // async executeToUpdatePassword(dto: UpdateUserPasswordDTO): Promise<UpdateUserResponseDTO> {
    // }
}

