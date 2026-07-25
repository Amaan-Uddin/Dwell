import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { ISessionService } from "@/core/infrastructure/persistence/drizzle/services/ISessionService"
import { GetUserResponseDTO } from "../../dtos/user/GetUser/GetUserResponseDTO"
import { GetUserDTO, GetUserFromClerkDTO, GetUserFromSessionDTO } from "../../dtos/user/GetUser/GetUserDTO"
import { UserMapper } from "../../mappers/user/UserMapper"
import { IClerkService } from "@/core/infrastructure/auth-services/clerk/IClerkService"
import { User } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"

export class GetUser {
    constructor(
        private userRepo: IUserRepository,
        private sessionService: ISessionService,
        private clerkService: IClerkService
    ) { }

    async executeFromClerkSession(dto: GetUserFromClerkDTO): Promise<GetUserResponseDTO> {
        let user = await this.userRepo.findByExternalAuthId(dto.externalAuthId)

        // performing JIT=Just-In-Time Provisioning, we are creating a local user in our db at the moment we need it, rather than upfront
        if (!user) {
            const clerkProfile = await this.clerkService.fetchUser(dto.externalAuthId)

            const clerkUserEmail = clerkProfile.primaryEmailAddress?.emailAddress
            if (!clerkUserEmail) throw new Error(`Clerk user ${dto.externalAuthId} has no email set as primary email.`)
            user = User.create({
                firstName: clerkProfile.firstName ?? "Unknown",
                email: Email.create(clerkProfile.primaryEmailAddress?.emailAddress),
                externalAuthId: dto.externalAuthId
            })

            await this.userRepo.save(user)
        }

        return UserMapper.toGetUserDTO(user)
    }

    async executeFromSessionId(dto: GetUserFromSessionDTO): Promise<GetUserResponseDTO | null> {
        const session = await this.sessionService.validateSession(dto.sessionId)
        if (!session) return null

        const user = await this.userRepo.findById(session.userId)
        if (!user) throw new Error(`User with ID=${session.userId} does not exist.`)

        return UserMapper.toGetUserDTO(user)
    }

    async execute(dto: GetUserDTO): Promise<GetUserResponseDTO | null> {
        const user = await this.userRepo.findById(dto.userId)
        if (!user) throw new Error(`User with ID=${dto.userId} does not exist.`)

        return UserMapper.toGetUserDTO(user)
    }
}