import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { ISessionService } from "@/core/infrastructure/persistence/drizzle/services/ISessionService"
import { GetUserResponseDTO } from "../../dtos/user/GetUser/GetUserResponseDTO"
import { GetUserDTO, GetUserFromSessionDTO } from "../../dtos/user/GetUser/GetUserDTO"
import { UserMapper } from "../../mappers/user/UserMapper"

export class GetUser {
    constructor(
        private userRepo: IUserRepository,
        private sessionService: ISessionService
    ) { }

    // async executeFromClerkSession(): Promise<GetUserResponseDTO | null> { }

    async executeFromSessionId(dto: GetUserFromSessionDTO): Promise<GetUserResponseDTO | null> {
        const session = await this.sessionService.validateSession(dto.sessionId)
        if (!session) return null

        const user = await this.userRepo.findById(session.userId)
        if (!user) return null

        return UserMapper.toGetUserDTO(user)
    }

    async execute(dto: GetUserDTO): Promise<GetUserResponseDTO | null> {
        const user = await this.userRepo.findById(dto.userId)
        if (!user) return null

        return UserMapper.toGetUserDTO(user)
    }
}