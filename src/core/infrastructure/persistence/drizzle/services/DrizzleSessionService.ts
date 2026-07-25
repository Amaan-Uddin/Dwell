import { Database } from "@/db";
import { session as SessionTb } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto"
import { drizzleErrorLogger } from "../utils";
import { ISessionService } from "@/core/infrastructure/persistence/drizzle/services/ISessionService";

export class SessionService implements ISessionService {
    constructor(private db: Database) { }

    async createSession(userId: string, ttl: number = 7 * 24 * 60 * 60): Promise<{ sessionId: string }> {
        const sessionId = crypto.randomBytes(32).toString("base64")
        const expiresAt = new Date(Date.now() + ttl * 1000)

        try {
            await this.db.insert(SessionTb).values({ id: sessionId, userId: userId, expiresAt: expiresAt })
            return { sessionId: sessionId }
        } catch (error) {
            drizzleErrorLogger(error, { operation: "createSession", userId: userId })
            throw new Error("Failed to create session.", { cause: error })
        }

    }
    async validateSession(sessionId: string): Promise<{ userId: string } | null> {
        try {
            if (!sessionId.trim()) throw new Error("Cannot validate a session without a sessionID.")

            const session = await this.db.select().from(SessionTb).where(eq(SessionTb.id, sessionId)).limit(1)
            if (!session || session[0].expiresAt < new Date()) {
                if (session && session[0].id) this.deleteSession(session[0].id)
                return null
            }

            return { userId: session[0].userId }
        } catch (error) {
            drizzleErrorLogger(error, { operation: "validateSession" })
            throw new Error("Failed to validate session.", { cause: error })
        }
    }
    async deleteSession(sessionId: string): Promise<void> {
        try {
            if (!sessionId.trim()) throw new Error("Cannot delete session without a valid sessionID")
            await this.db.delete(SessionTb)
                .where(eq(SessionTb.id, sessionId))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "deleteSession" })
        }
    }
}