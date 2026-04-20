import { Email } from "../value-objects/Email"
import { Password } from "../value-objects/Password"

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

    static create(params: {
        firstName: string,
        lastName?: string,
        email: Email,
        password?: Password,
        externalAuthId?: string,
        role?: UserRoles
    }): User {
        if (!params.firstName?.trim()) {
            throw new Error("First name must not be empty.")
        }

        if (!params.password && !params.externalAuthId) {
            throw new Error("Password or user auth ID must be provided.")
        }

        const now = new Date()

        return new User(
            {
                id: crypto.randomUUID(),
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
                password: params.password,
                externalAuthId: params.externalAuthId,
                status: UserStatus.ACTIVE,
                role: params.role ?? UserRoles.USER,
                createdAt: now,
                updatedAt: now
            }
        )
    }

    static createGuest(sessionId: string): User {
        const now = new Date()

        return new User({
            id: sessionId,
            firstName: "Guest",
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

    get firstName(): string {
        return this.props.firstName
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


    // transforming guest to user
    promoteGuestToUser(params: {
        firstName: string,
        lastName?: string,
        email: Email,
        password?: Password,
        externalAuthId?: string,
    }): void {
        if (!this.isGuest()) {
            throw new Error("Not a guest, cannot be promoted to a user.")
        }

        if (!params.firstName?.trim()) {
            throw new Error("First name must not be empty.")
        }

        if (!params.password && !params.externalAuthId) {
            throw new Error("Password or external auth ID must be provided.")
        }

        this.props.firstName = params.firstName
        this.props.lastName = params.lastName
        this.props.email = params.email
        this.props.password = params.password
        this.props.externalAuthId = params.externalAuthId
        this.props.role = UserRoles.USER

        this.markAsUpdated()
    }

    promoteUserToAdmin(): void {
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

    demoteAdminToUser(): void {
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