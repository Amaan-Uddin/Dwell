import { Email } from "../value-objects/Email"
import { Password } from "../value-objects/Password"

enum UserStatus {
    ACTIVE = "ACTIVE",
    DELETED = "DELETED"
}

enum UserRoles {
    ADMIN = "ADMIN",
    USER = "USER",
    GUEST = "GUEST"
}

export interface UserProps {
    id: number
    firstName: string
    lastName?: string
    fullName: string
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
    constructor() { }
}