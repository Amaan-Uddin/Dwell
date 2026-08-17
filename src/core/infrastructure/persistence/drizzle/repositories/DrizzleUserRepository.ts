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

    async save({ user }: { user: User }): Promise<User> {
        const db_row = this.toPersistence(user)
        try {
            const [row] = await this.db.insert(UserTb).values(db_row).onConflictDoUpdate({
                target: UserTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save", user: user })
            throw new Error("Failed to save user data to db.", { cause: error })
        }
    }

    async forceDelete({ id }: { id: string }): Promise<void> {
        if (!id.trim()) throw new Error("Cannot force delete a user without an ID.")
        try {
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

    async findById({ id }: { id: string }): Promise<User | null> {
        if (!id.trim()) throw new Error("Cannot find user without ID.")
        try {
            const [row] = await this.db.select().from(UserTb).where(eq(UserTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById", id: id })
            throw new Error(`Failed to find user with id=${id}.`, { cause: error })
        }
    }

    async findByEmail({ email }: { email: string }): Promise<User | null> {
        if (!email.trim()) throw new Error("Cannot find user without email.")
        try {
            const [row] = await this.db.select().from(UserTb).where(eq(UserTb.email, email))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByEmail", email: email })
            throw new Error(`Failed to find user with email=${email}.`, { cause: error })
        }
    }

    async findByExternalAuthId({ externalAuthId }: { externalAuthId: string }): Promise<User | null> {
        if (!externalAuthId.trim()) throw new Error("Cannot find user without externalAuthId.")
        try {
            const [row] = await this.db.select().from(UserTb).where(eq(UserTb.externalAuthId, externalAuthId)).limit(1)
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByExternalAuthId", authId: externalAuthId })
            throw new Error(`Failed to find user with externalAuthId=${externalAuthId}.`, { cause: error })
        }
    }

    async findByStatus({ status }: { status: UserStatus }): Promise<User[]> {
        if (!status) throw new Error("Cannot find user without valid status.")
        try {
            const result = await this.db.select().from(UserTb).where(eq(UserTb.status, status))
            return result.map((user) => (this.toDomain(user)))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByStatus" })
            throw new Error(`Failed to retrieve users with status=${status}.`, { cause: error })
        }
    }

    async findByRole({ role }: { role: UserRoles }): Promise<User[]> {
        if (!role) throw new Error("Cannot find user without valid role.")
        try {
            const result = await this.db.select().from(UserTb).where(eq(UserTb.role, role))
            return result.map((user) => (this.toDomain(user)))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByRole" })
            throw new Error(`Failed to find users with role=${role}.`, { cause: error })
        }
    }

    private toDomain(db_user: UserSelectType): User {
        if (!Object.values(UserStatus).includes(db_user.status as UserStatus)) {
            throw new Error(`Database corruption detected: Invalid user status ${db_user.status}`)
        }
        if (!Object.values(UserRoles).includes(db_user.role as UserRoles)) {
            throw new Error(`Database corruption detected: Invalid user role ${db_user.role}`)
        }
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