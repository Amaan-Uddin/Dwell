import { Email } from "../value-objects/Email"
import { Password, IPasswordHasher } from "../value-objects/Password"

enum UserStatus {
    ACTIVE = "ACTIVE",
    DELETED = "DELETED"
}

export enum UserRoles {
    ADMIN = "ADMIN",
    USER = "USER",
    GUEST = "GUEST"
}

export interface UserProps {
    id: string
    firstName: string
    lastName?: string
    email: Email,
    password?: Password
    externalAuthId?: string
    status: UserStatus
    role: UserRoles
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date
}

export class User {
    private constructor(private props: UserProps) { }

    static async create(params: {
        firstName: string,
        lastName?: string,
        email: string,
        password?: string,
        externalAuthId?: string,
        role?: string
    }, hasher: IPasswordHasher): Promise<User> {

        // firstName is required so we must ensure it exist and check its length after trimming
        if (!params.firstName || params.firstName.trim().length == 0) {
            throw new Error("First name must not be empty.")
        }

        // lastName is optional, so we check if it exist, if so then check length after trimming
        if (params.lastName && params.lastName.trim().length == 0) {
            throw new Error("Last name must cannot be empty.")
        }

        const email = Email.create(params.email)
        const password = params.password ? await Password.create(params.password, hasher) : undefined

        const now = new Date()

        // check if role exist and then verify whether the role is included in the UserRoles enum.
        // we are asserting the params.role as UserRole to remove the typescript error of string not being assignable to UserRoles
        if (params.role && !Object.values(UserRoles).includes(params.role as UserRoles)) {
            throw new Error("Invalid user role provided.")
        }

        return new User(
            {
                id: crypto.randomUUID(),
                firstName: params.firstName.trim(),
                lastName: params.lastName?.trim(),
                email: email,
                password: password,
                externalAuthId: params.externalAuthId,
                status: UserStatus.ACTIVE,
                role: params.role as UserRoles || UserRoles.USER,
                createdAt: now,
                updatedAt: now
            }
        )
    }
}