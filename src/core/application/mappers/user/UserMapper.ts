import { DeleteUserResponseDTO, RegisterUserResponseDTO } from "../../dtos/user/UserResponseDTO"
import { User } from "@/core/domain/auth/entities/User"

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

}