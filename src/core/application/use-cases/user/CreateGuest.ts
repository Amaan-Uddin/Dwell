import { User } from "@/core/domain/auth/entities/User";
import { ISessionService } from "@/core/infrastructure/persistence/drizzle/services/ISessionService";
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository";
import { UserMapper } from "../../mappers/UserMapper";
import { CreateGuestResponseDTO } from "../../dtos/user/CreateGuestDTO";

export class CreateGuest {
    constructor(private userRepo: IUserRepository, private sessionService: ISessionService) { }

    async execute(): Promise<CreateGuestResponseDTO> {
        // create a guest user object
        const guest = User.createGuest()

        // save the guest to our db
        await this.userRepo.save({ user: guest })

        // create a session for the guest
        const { sessionId } = await this.sessionService.createSession(guest.id)

        // return the guest ID and session ID back to client
        return UserMapper.toCreateGuestDTO(guest, sessionId)
    }

}