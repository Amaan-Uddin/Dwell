import { User as ClerkUser, Session, SignInToken } from "@clerk/backend"
import { User } from "@/core/domain/auth/entities/User"

export interface IClerkService {
    createUser(user: User): Promise<ClerkUser>
    updateUserFirstAndLastName(user: User): Promise<ClerkUser>
    updateUserEmailAddress(user: User): Promise<ClerkUser>
    updateUserPassword(user: User): Promise<ClerkUser>
    deleteUser(userId: string): Promise<ClerkUser>

    createSignInToken(userId: string, expiresInSeconds: number): Promise<SignInToken>
    revokeSession(sessionId: string): Promise<Session>

    errorLog(error: unknown, context: Record<string, unknown>): void
}