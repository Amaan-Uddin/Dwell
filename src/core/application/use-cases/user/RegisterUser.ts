import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { RegisterUserDTO } from "../../dtos/user/RegisterUserDTO"
import { UserMapper } from "../../mappers/UserMapper"
import { User } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { IPasswordHasher, Password } from "@/core/domain/auth/value-objects/Password"
import { RegisterUserResponseDTO } from "../../dtos/user/RegisterUserDTO"

export class RegisterUser {
    constructor(
        private userRepo: IUserRepository,
        private hasher: IPasswordHasher
    ) { }

    async execute(dto: RegisterUserDTO): Promise<RegisterUserResponseDTO> {
        // find if an user with same email id exists or not
        const emailTaken = await this.userRepo.findByEmail({ email: dto.email })
        if (emailTaken) throw new Error("Email already in use.")

        // create a validated email value object
        const email = Email.create(dto.email)

        // validate the password
        Password.validate(dto.password)
        // then hash the password using a hasher
        const passwordHash = await this.hasher.hash(dto.password)
        // finally create a password value object
        const password = Password.createFromHash(passwordHash)

        // now we create a user object that performs validation on domain level 
        const user = User.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: email,
            password: password
        })

        // save the user to our database
        const savedUser = await this.userRepo.save({ user: user })

        // return a JSON compatible response back to client
        return UserMapper.toRegisterUserDTO(savedUser)
    }
}
