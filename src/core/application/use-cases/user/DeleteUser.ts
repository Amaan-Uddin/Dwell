import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { DeleteUserDTO } from "../../dtos/user/DeleteUser/DeleteUserDTO"
import { UserMapper } from "../../mappers/user/UserMapper"
import { DeleteUserResponseDTO } from "../../dtos/user/DeleteUser/DeleteUserResponseDTO"

export class DeleteUser {
    constructor(private userRepo: IUserRepository) { }

    async execute(dto: DeleteUserDTO): Promise<DeleteUserResponseDTO> {
        // find the user by the id provided
        const user = await this.userRepo.findById(dto.id)
        if (!user) throw new Error(`User with ID=${dto.id} does not exist.`)

        // if user exists then invoke the deleteUser() method to update the object state
        user.deleteUser()
        // now persist the updated user state to database
        const deletedUser = await this.userRepo.save(user)

        // return the deleted user response to client
        return UserMapper.toDeleteUserDTO(deletedUser)
    }
}