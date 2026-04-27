import { UserResponseDTO } from "../../dtos/user/UserResponseDTO"
import { User } from "@/core/domain/auth/entities/User"

export class UserMapper {
    static toDTO(user: User): UserResponseDTO {
        return {
            id: user.id,
            email: user.email.value,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            ...(user.firstName && { firstName: user.firstName }),
            ...(user.lastName && { lastName: user.lastName }),
            ...(user.externalAuth && { externalAuthId: user.externalAuth }),
            ...(user.status && { status: user.status }),
            ...(user.role && { role: user.role }),
            ...(user.deletedAt && { deletedAt: user.deletedAt })
        }
    }

    static toDTOList(users: User[]): UserResponseDTO[] {
        return users.map(user => UserMapper.toDTO(user))
    }
}