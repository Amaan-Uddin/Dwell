import { Email } from "../value-objects/Email"
import { Password } from "../value-objects/Password"
import { randomUUID } from "crypto"

export enum UserStatus {
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
    lastName: string | null
    fullName: string
    email: Email,
    password: Password | null
    externalAuthId: string | null
    status: UserStatus
    role: UserRoles
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

export class User {
    private constructor(private props: UserProps) { }

    /**
     * Creates a new User entity with generated ID, and timestamps.
     * 
     * @param params Holds important user data.
     * @returns A newly created `User` object.
     * @throws If `params.firstName` is empty or if both `params.password` and `params.externalAuth` are missing.
     */
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

        if (!params.password?.value && !params.externalAuthId) {
            throw new Error("Password or user auth ID must be provided.")
        }

        const now = new Date()

        return new User(
            {
                id: randomUUID(),
                firstName: params.firstName,
                lastName: params.lastName ?? null,
                fullName: params.lastName?.trim() ? `${params.firstName} ${params.lastName}` : params.firstName,
                email: params.email,
                password: params.password ?? null,
                externalAuthId: params.externalAuthId ?? null,
                status: UserStatus.ACTIVE,
                role: params.role ?? UserRoles.USER,
                createdAt: now,
                updatedAt: now,
                deletedAt: null
            }
        )
    }

    /**
     * Creates a temporary guest user for limited access.
     * 
     * @param params Optional, can pass a pre-generated ID or a random UUID is generated on call.
     * @returns A guest `User` object.
     */
    static createGuest(params?: {
        id?: string
    }): User {
        const now = new Date()
        const ID = params?.id ?? randomUUID()
        return new User({
            id: ID,
            firstName: "Guest",
            lastName: null,
            fullName: "Guest",
            email: Email.create(`Guest-${ID}@hrp.guest`),
            password: null,
            externalAuthId: null,
            status: UserStatus.ACTIVE,
            role: UserRoles.GUEST,
            createdAt: now,
            updatedAt: now,
            deletedAt: null
        })
    }

    /**
     * Reconstitute User from a db row.
     * 
     * @param props User object structure.
     * @returns A `User` object from db row. 
     */
    static reconstitute(props: UserProps): User {
        return new User(props)
    }

    toObject(): UserProps {
        return { ...this.props }
    }

    private markAsUpdated(): void {
        this.props.updatedAt = new Date()
    }

    get id(): string {
        return this.props.id
    }
    get firstName(): string {
        return this.props.firstName
    }
    get lastName(): string | null {
        return this.props.lastName
    }
    get fullName(): string {
        return this.props.fullName
    }
    get email(): Email {
        return this.props.email
    }
    get externalAuthId(): string | null {
        return this.props.externalAuthId
    }
    get status(): UserStatus {
        return this.props.status
    }
    get role(): UserRoles {
        return this.props.role
    }
    get createdAt(): Date {
        return this.props.createdAt
    }
    get updatedAt(): Date {
        return this.props.updatedAt
    }
    get deletedAt(): Date | null {
        return this.props.deletedAt
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

    /**
     * Promotes guest users to actual users.
     * 
     * Updates the existing fields to hold actual data.
     * 
     * @param params Holds important user data.
     * @throws If object role is not Guest.
     * @throws If `params.firstName` is empty or if both `params.password` and `params.externalAuth` are missing.
    */
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
        this.props.lastName = params.lastName ?? null
        this.props.fullName = params.lastName?.trim() ? `${params.firstName} ${params.lastName}` : params.firstName
        this.props.email = params.email
        this.props.password = params.password ?? null
        this.props.externalAuthId = params.externalAuthId ?? null
        this.props.role = UserRoles.USER

        this.markAsUpdated()
    }

    /**
     * Promotes normal user to admin.
     * 
     * Updates object role and marks with timestamp.
     * 
     * @throws If object role is already Admin or if role is Guest
     */
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

    /**
     * Demotes an Admin back to normal user.
     * 
     * Updates object role and marks with timestamp.
     * 
     * @throws If object role is already a User or is a Guest.
     */
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

    /**
     * Deletes a user.
     * 
     * Soft deletion, updates object status and marks with timestamp.
     * 
     * @throws If object status is already `Deleted` or if user is an `Admin`
     */
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

    /**
     * Update a user first and last name
     * 
     * @param params Holds user firstName and lastName
     * @throws If params.firstName is empty.
     */
    updateProfile(params: {
        firstName: string,
        lastName?: string,
    }): void {
        if (!params.firstName?.trim()) {
            throw new Error("First Name must not be empty.")
        }
        this.props.firstName = params.firstName
        this.props.lastName = params.lastName ?? null
        this.props.fullName = params.lastName?.trim() ? `${params.firstName} ${params.lastName}` : params.firstName
        this.markAsUpdated()
    }

    /**
     * Updates user email
     * 
     * @param params Holds user email
     */
    updateEmail(params: {
        email: Email
    }): void {
        this.props.email = params.email
        this.markAsUpdated()
    }

    /**
     * Updates user externalAuthId
     * 
     * @param params Holds user externalAuthId 
     */
    updateExternalAuthId(params: {
        externalAuthId: string
    }): void {
        if (!params.externalAuthId?.trim()) {
            throw new Error("External auth id must not be empty.")
        }

        this.props.externalAuthId = params.externalAuthId
        this.markAsUpdated()
    }

    /**
     * Updates user password
     * 
     * @param params Holds user password
     */
    updatePassword(params: {
        password: Password
    }): void {
        this.props.password = params.password
        this.markAsUpdated()
    }
}