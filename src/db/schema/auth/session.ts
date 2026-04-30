import { uuid, timestamp, varchar } from "drizzle-orm/pg-core"
import { authSchema } from "./schema"
import { user } from "./user"

/**
 * Session table for managing user session
 * Mainly will used for managing guest session as we are using Clerk for managing authenticated user session
 */
export const session = authSchema.table("session", {
    id: varchar({ length: 64 }).primaryKey(),
    userId: uuid().references(() => user.id).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    expiresAt: timestamp().notNull(),
})