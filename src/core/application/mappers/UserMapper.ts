import { User } from "@/core/domain/auth/entities/User"
import { RegisterUserResponseDTO } from "../dtos/user/RegisterUserDTO"
import { DeleteUserResponseDTO } from "../dtos/user/DeleteUserDTO"
import { CreateGuestResponseDTO } from "../dtos/user/CreateGuestDTO"
import { GetUserResponseDTO } from "../dtos/user/GetUserDTO"
import { UpdateUserResponseDTO } from "../dtos/user/UpdateUserDTO"

export class UserMapper {
    static toRegisterUserDTO(user: User): RegisterUserResponseDTO {
        return {
            id: user.id,
            email: user.email.value,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    static toRegisterUserDTOList(users: User[]): RegisterUserResponseDTO[] {
        return users.map(user => UserMapper.toRegisterUserDTO(user))
    }

    static toDeleteUserDTO(user: User): DeleteUserResponseDTO {
        return {
            id: user.id,
            status: user.status,
            deletedAt: user.deletedAt!
        }
    }

    static toCreateGuestDTO(guest: User, sessionId: string): CreateGuestResponseDTO {
        return {
            id: guest.id,
            fullName: guest.fullName,
            sessionId: sessionId
        }
    }

    static toGetUserDTO(user: User): GetUserResponseDTO {
        return {
            id: user.id,
            email: user.email.value,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            status: user.status,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    static toUpdateUserDTO(user: User): UpdateUserResponseDTO {
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email.value,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

}