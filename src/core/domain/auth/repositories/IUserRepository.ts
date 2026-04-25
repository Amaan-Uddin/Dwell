import { User, UserRoles } from "../entities/User"

export interface IUserRepository {
    save(user: User): Promise<User>
    findById(id: string): Promise<User | null>

    findByEmail(email: string): Promise<User | null>
    findByExternalAuthId(externalAuthId: string): Promise<User | null>

    findActiveUsers(): Promise<User[]>
    findByRole(role: UserRoles): Promise<User[]>

    forceDelete(id: string): Promise<void>
    softDelete(user: User): Promise<string>
}