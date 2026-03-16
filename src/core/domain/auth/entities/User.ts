import { Email } from "../value-objects/Email"

export interface UserProps {
    id: number
    firstName: string
    lastName?: string
    fullName: string
    email: Email,
    password: string
    status: string
    role: string
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date
}

export class User {
    constructor() { }
}