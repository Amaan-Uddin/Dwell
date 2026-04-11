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
    fullName?: string
    email?: Email,
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

    // factory method for creating a user
    static async create(params: {
        firstName: string,
        lastName?: string,
        email: string,
        password?: string,
        externalAuthId?: string,
        role?: string
    }, hasher: IPasswordHasher): Promise<User> {

        // firstName is required so we must ensure it exist and check its length after trimming
        if (!params.firstName?.trim()) {
            throw new Error("First name must not be empty.")
        }

        // lastName is optional, so we check if it exist, if so then check length after trimming
        // if (params.lastName && params.lastName.trim().length === 0) {
        //     throw new Error("Last name cannot be empty.")
        // }

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
                firstName: params.firstName,
                lastName: params.lastName,
                email: email,
                password: password,
                externalAuthId: params.externalAuthId,
                status: UserStatus.ACTIVE,
                role: params.role as UserRoles,
                createdAt: now,
                updatedAt: now
            }
        )
    }

    // factory method for guest users
    static createGuest(sessionId: string): User {
        // guest users will not have many of the UserProps so we can default the values in core logic
        const now = new Date()

        return new User({
            id: sessionId,
            firstName: "Guest",
            lastName: undefined,
            email: undefined,
            password: undefined,
            externalAuthId: undefined,
            status: UserStatus.ACTIVE,
            role: UserRoles.GUEST,
            createdAt: now,
            updatedAt: now
        })
    }

    // reconstitute the User from persistence (from Database)
    // when loading from db we trust the data as it was previously validated before being stored
    static reconstitute(props: UserProps): User {
        return new User(props)
    }

    // Getters
    get id(): string {
        return this.props.id
    }

    get fullName(): string | undefined {
        return this.props.fullName
    }

    get email(): string | undefined {
        return this.props.email?.value
    }

    get status(): string {
        return this.props.status
    }

    get role(): string {
        return this.props.role
    }


    isGuest(): boolean {
        return this.props.role === UserRoles.GUEST
    }
    isUser(): boolean {
        return this.props.role === UserRoles.USER
    }
    isAdmin(): boolean {
        return this.props.role === UserRoles.ADMIN
    }

    isActive(): boolean {
        return this.props.status === UserStatus.ACTIVE
    }
    isDeleted(): boolean {
        return this.props.status === UserStatus.DELETED
    }

    // Business methods
    // methods for change of state of password
    async verifyPassword(plainText: string, hasher: IPasswordHasher): Promise<boolean> {
        if (!this.props.password) {
            return false
        }
        return await this.props.password.verify(plainText, hasher)
    }

    async changePassword(oldPassword: string, newPassword: string, hasher: IPasswordHasher): Promise<void> {
        if (!this.props.password) {
            throw new Error("User does not have a password.")
        }

        if (!(await this.verifyPassword(oldPassword, hasher))) {
            throw new Error("Incorrect password.")
        }

        const password = await Password.create(newPassword, hasher)

        this.props.password = password
        this.markAsUpdated()
    }

    async resetPassword(newPassword: string, hasher: IPasswordHasher): Promise<void> {
        if (!this.props.password) {
            throw new Error("User does not have a password.")
        }

        if (await this.verifyPassword(newPassword, hasher)) {
            throw new Error("New password cannot be same as old password.")
        }

        const password = await Password.create(newPassword, hasher)

        this.props.password = password
        this.markAsUpdated()
    }

    // transforming guest to user
    async promoteGuestToUser(params: {
        firstName: string,
        lastName?: string,
        email: string,
        password?: string,
        externalAuthId?: string,
    }, hasher: IPasswordHasher): Promise<void> {
        if (!this.isGuest()) {
            throw new Error("Not a guest, cannot be promoted to a user.")
        }

        if (!params.firstName?.trim()) {
            throw new Error("First name must not be empty.")
        }
        this.props.firstName = params.firstName

        // if (params.lastName && params.lastName.trim().length === 0) {
        //     throw new Error("Last name cannot be empty.")
        // }
        this.props.lastName = params.lastName

        this.props.email = Email.create(params.email)
        this.props.password = params.password ? await Password.create(params.password, hasher) : undefined
        this.props.externalAuthId = params.externalAuthId

        this.props.role = UserRoles.USER

        this.markAsUpdated()
    }

    promoteToAdmin(): void {
        if (!this.isUser()) {
            if (this.isAdmin()) {
                throw new Error("User is already an admin.")
            }
            if (this.isGuest()) {
                throw new Error("Guest cannot be promoted to an admin.")
            }
        }

        this.props.role = UserRoles.ADMIN
        this.markAsUpdated()
    }

    demoteToUser(): void {
        if (!this.isAdmin()) {
            if (this.isUser()) {
                throw new Error("Already has user role.")
            }
            if (this.isGuest()) {
                throw new Error("Guest cannot be demoted to user.")
            }
        }

        this.props.role = UserRoles.USER
        this.markAsUpdated()
    }

    // deleting user (soft delete: update a flag i.e status to say DELETED)
    deleteUser(): void {
        if (this.isDeleted()) {
            throw new Error("User is already deleted.")
        }

        if (this.isAdmin()) {
            throw new Error("User cannot be deleted.")
        }

        const now = new Date()

        this.props.status = UserStatus.DELETED
        this.props.updatedAt = now
        this.props.deletedAt = now
    }

    // utility methods
    toObject(): UserProps {
        return { ...this.props }
    }

    private markAsUpdated(): void {
        this.props.updatedAt = new Date()
    }
}