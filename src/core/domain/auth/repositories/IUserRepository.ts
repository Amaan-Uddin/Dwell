import { User, UserRoles, UserStatus } from "../entities/User"

export interface IUserRepository {
    save(params: { user: User }): Promise<User>
    findById(params: { id: string }): Promise<User | null>

    findByEmail(params: { email: string }): Promise<User | null>
    findByExternalAuthId(params: { externalAuthId: string }): Promise<User | null>

    findByStatus(params: { status: UserStatus }): Promise<User[]>
    findByRole(params: { role: UserRoles }): Promise<User[]>

    forceDelete(params: { id: string }): Promise<void>
}