export interface ISessionService {
    createSession(userId: string, ttl?: number): Promise<{ sessionId: string }>
    validateSession(sessionId: string): Promise<{ userId: string } | null>
    deleteSession(sessionId: string): Promise<void>
}