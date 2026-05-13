import { User } from "@/core/domain/auth/entities/User"
import { User as ClerkUser, SignInToken, Session, ClerkClient } from "@clerk/backend"
import { IClerkService } from "./IClerkService"
import { UserSelectType } from "@/db/schema/auth/user"

export class ClerkService implements IClerkService {
    constructor(private client: ClerkClient) { }

    errorLog(error: unknown, context: Record<string, unknown>): void {
        const logData = { ...context, timestamp: new Date().toISOString() }

        if (error instanceof Error) {
            console.error("Clerk Service Error::", {
                ...logData,
                message: error.message
            }
            )
        } else {
            console.error("Non-error thrown::", { ...logData, error })
        }
    }

    async createUser(user: User): Promise<ClerkUser> {
        const db_row = this.toPersistence(user)
        try {
            return await this.client.users.createUser({
                firstName: db_row.firstName,
                lastName: db_row.lastName ?? undefined, // because db_row.lastName can be string or null
                emailAddress: [db_row.email],
                password: db_row.password ?? undefined, // same as before, we use nullish to fallback undefined because clerk does not accept null for optional fields
                createdAt: db_row.createdAt,
            })
        } catch (error) {
            this.errorLog(error, { "operation": "createUser" })
            throw new Error("Failed to create user in clerk.", { cause: error })
        }
    }

    async updateUserFirstAndLastName(user: User): Promise<ClerkUser> {
        const db_row = this.toPersistence(user)
        try {
            if (!db_row.externalAuthId?.trim()) throw new Error("Invalid operation, user is missing externalAuthId.")
            return await this.client.users.updateUser(db_row.externalAuthId, {
                firstName: db_row.firstName,
                lastName: db_row.lastName ?? undefined,
            })
        } catch (error) {
            this.errorLog(error, { "operation": "updateUserFirstAndLastName" })
            throw new Error("Failed to update user name in clerk.", { cause: error })
        }
    }

    async updateUserEmailAddress(user: User): Promise<ClerkUser> {
        const db_row = this.toPersistence(user)
        try {
            if (!db_row.externalAuthId?.trim()) throw new Error("Invalid operation, user is missing externalAuthId.")
            // TODO verify email address before updating
            const email = await this.client.emailAddresses.createEmailAddress({ userId: db_row.externalAuthId, emailAddress: db_row.email, verified: true })
            return await this.client.users.updateUser(db_row.externalAuthId, {
                primaryEmailAddressID: email.id
            })
        } catch (error) {
            this.errorLog(error, { "operation": "updateUserEmailAddress" })
            throw new Error("Failed to update user's email address.", { cause: error })
        }
    }

    async updateUserPassword(user: User): Promise<ClerkUser> {
        const db_row = this.toPersistence(user)
        try {
            if (!db_row.externalAuthId?.trim()) throw new Error("Invalid operation, user is missing externalAuthId.")
            if (!db_row.password?.trim()) throw new Error("Invalid operation, user is missing a password.")

            return await this.client.users.updateUser(db_row.externalAuthId, {
                password: db_row.password,
                signOutOfOtherSessions: true
            })
        } catch (error) {
            this.errorLog(error, { "operation": "updateUserPassword" })
            throw new Error("Failed to update user's password.", { cause: error })
        }
    }

    async deleteUser(userId: string): Promise<ClerkUser> {
        try {
            if (!userId?.trim()) throw new Error("Invalid operation, userId is missing.")
            return await this.client.users.deleteUser(userId)
        } catch (error) {
            this.errorLog(error, { "operation": "deleteUser" })
            throw new Error("Failed to delete user from clerk.", { cause: error })
        }
    }

    async createSignInToken(userId: string, expiresInSeconds: number = 24 * 60 * 60): Promise<SignInToken> {
        try {
            if (!userId?.trim()) throw new Error("Invalid operation, userId is missing.")
            return await this.client.signInTokens.createSignInToken({
                userId: userId,
                expiresInSeconds: expiresInSeconds
            })
        } catch (error) {
            this.errorLog(error, { "operation": "createSignInToken" })
            throw new Error("Failed to create sign-in token.", { cause: error })
        }
    }

    async revokeSession(sessionId: string): Promise<Session> {
        try {
            if (!sessionId?.trim()) throw new Error("Invalid operation, sessionId is missing.")
            return await this.client.sessions.revokeSession(sessionId)
        } catch (error) {
            this.errorLog(error, { "operation": "revokeSession" })
            throw new Error("Failed to revoke session.", { cause: error })
        }
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