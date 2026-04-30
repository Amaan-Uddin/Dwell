import { User, UserRoles, UserStatus } from "@/core/domain/auth/entities/User"
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { Password } from "@/core/domain/auth/value-objects/Password"
import { Database } from "@/db"
import { UserSelectType, user as UserTb } from "@/db/schema/auth/user"
import { and, eq, isNull, not } from "drizzle-orm"
import { drizzleErrorLogger } from "../utils"

export class DrizzleUserRepository implements IUserRepository {
    constructor(private readonly db: Database) { }

    async save(user: User): Promise<User> {
        const db_row = this.toPersistence(user)
        try {
            const inserted = await this.db.insert(UserTb).values(db_row).onConflictDoUpdate({
                target: UserTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(inserted[0])
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save", user: user })
            throw new Error("Failed to save user data to db.", { cause: error })
        }
    }

    async forceDelete(id: string): Promise<void> {
        try {
            if (!id.trim()) throw new Error("Cannot force delete a user without an ID.")
            const result = await this.db.delete(UserTb)
                .where(
                    and(
                        eq(UserTb.id, id),
                        eq(UserTb.status, "DELETED"),
                        not(isNull(UserTb.deletedAt))
                    )
                ).returning({ deletedId: UserTb.id, deletedEmail: UserTb.email })
            console.log(`Deleted user with id=${result[0].deletedId} and email=${result[0].deletedEmail}`)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "ForceDelete", id: id })
            throw new Error(`Failed to force delete user with id=${id}.`, { cause: error })
        }
    }

    async delete(user: User): Promise<User> {
        const db_row = this.toPersistence(user)
        try {
            const result = await this.db.update(UserTb)
                .set({ status: db_row.status, updatedAt: db_row.updatedAt, deletedAt: db_row.deletedAt })
                .where(and(eq(UserTb.id, db_row.id), eq(UserTb.email, db_row.email)))
                .returning()
            return this.toDomain(result[0])
        } catch (error) {
            drizzleErrorLogger(error, { operation: "softDelete", user: user })
            throw new Error("Failed to soft delete user.", { cause: error })
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            if (!id.trim()) throw new Error("Cannot find user without ID.")
            const fetchData = await this.db.select().from(UserTb).where(eq(UserTb.id, id)).limit(1)
            return fetchData[0] ? this.toDomain(fetchData[0]) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById", id: id })
            throw new Error(`Failed to find user with id=${id}.`, { cause: error })
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            if (!email.trim()) throw new Error("Cannot find user without email.")
            const result = await this.db.select().from(UserTb).where(eq(UserTb.email, email)).limit(1)
            return result[0] ? this.toDomain(result[0]) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByEmail", email: email })
            throw new Error(`Failed to find user with email=${email}.`, { cause: error })
        }
    }

    findByExternalAuthId(externalAuthId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    async findActiveUsers(): Promise<User[]> {
        try {
            const result = await this.db.select().from(UserTb).where(eq(UserTb.status, "ACTIVE"))
            return result.map((user) => (this.toDomain(user)))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findActiveUsers" })
            throw new Error("Failed to retrieve active users.", { cause: error })
        }
    }

    async findByRole(role: UserRoles): Promise<User[]> {
        try {
            if (!role) throw new Error("Cannot find user without valid role.")
            const result = await this.db.select().from(UserTb).where(eq(UserTb.role, role))
            return result.map((user) => (this.toDomain(user)))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByRole" })
            throw new Error(`Failed to find users with role=${role}.`, { cause: error })
        }
    }

    async findDeletedUsers(): Promise<User[]> {
        try {
            const result = await this.db.select().from(UserTb).where(eq(UserTb.status, "DELETED"))
            return result.map((user) => (this.toDomain(user)))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findSoftDeletedUsers" })
            throw new Error("Failed to retrieve deleted users.", { cause: error })
        }
    }

    private toDomain(db_user: UserSelectType): User {
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

    private toPersistence(user: User): UserSelectType {
        const userObj = user.toObject()
        return {
            id: userObj.id,
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            fullName: userObj.fullName,
            email: userObj.email.value,
            password: userObj.password?.value ?? null,
            externalAuthId: userObj.externalAuthId,
            status: userObj.status,
            role: userObj.role,
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt,
            deletedAt: userObj.deletedAt
        }
    }
}