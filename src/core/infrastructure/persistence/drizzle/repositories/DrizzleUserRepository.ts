import { User, UserRoles, UserStatus } from "@/core/domain/auth/entities/User"
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { Password } from "@/core/domain/auth/value-objects/Password"
import { Database } from "@/db"
import { user as UserTb } from "@/db/schema/auth/user"
import { DrizzleError, DrizzleQueryError, eq } from "drizzle-orm"


export interface PersistenceUser {
    id: string
    firstName: string
    lastName: string | null
    fullName: string
    email: string
    password: string | null
    externalAuthId: string | null
    status: "ACTIVE" | "DELETED"
    role: "ADMIN" | "USER" | "GUEST"
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}
export class DrizzleUserRepository implements IUserRepository {

    constructor(private readonly db: Database) { }

    async save(user: User): Promise<User> {
        const userObj = user.toObject()
        const db_data = {
            id: userObj.id,
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            fullName: userObj.fullName,
            email: userObj.email.value,
            password: userObj.password?.value,
            externalAuthId: userObj.externalAuthId,
            status: userObj.status,
            role: userObj.role,
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt,
            deletedAt: userObj.deletedAt
        }
        try {
            const inserted = await this.db.insert(UserTb).values(db_data).onConflictDoUpdate({
                target: UserTb.id,
                set: db_data
            }).returning()
            return this.toDomain(inserted[0])
        } catch (error) {
            this.errorLogger(error)
        }

    }

    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<User | null> {
        try {
            const fetchData = await this.db.select().from(UserTb).where(eq(UserTb.id, id))
            return fetchData[0] ? this.toDomain(fetchData[0]) : null
        } catch (error) {
            this.errorLogger(error)
        }
    }

    findByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    findByExternalAuthId(externalAuthId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    findActiveUsers(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    findByRole(role: UserRoles): Promise<User[]> {
        throw new Error("Method not implemented.");
    }

    private toDomain(db_user: PersistenceUser): User {
        return User.reconstitute({
            id: db_user.id,
            firstName: db_user.firstName,
            lastName: db_user.lastName,
            fullName: db_user.fullName,
            email: Email.reconstitute(db_user.email),
            password: db_user.password ? Password.reconstitute(db_user.password) : null,
            externalAuthId: db_user.externalAuthId,
            status: db_user.status as UserStatus,
            role: db_user.role as UserRoles,
            createdAt: db_user.createdAt,
            updatedAt: db_user.updatedAt,
            deletedAt: db_user.deletedAt
        })
    }

    private errorLogger(error: unknown): never {
        if (error instanceof DrizzleQueryError) {
            console.error("Query::", error.query)
            console.error("Drizzle Error::", error.cause?.message)
        } else if (error instanceof DrizzleError) {
            console.error("Drizzle Error::", error.message)
        } else if (error instanceof Error) {
            console.error("Unexpected Error::", error.message)
        } else {
            console.error("Non-error thrown::", error)
        }
        throw error
    }

}