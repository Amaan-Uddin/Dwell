import { User, UserRoles } from "../entities/User"
export interface IUserRepository {
    save(user: User): Promise<User>
    findById(id: string): Promise<User | null>

    findByEmail(email: string): Promise<User>
    findByExternalAuthId(externalAuthId: string): Promise<User>

    findActiveUsers(): Promise<User[]>
    findUsersByRole(role: UserRoles): Promise<User[]>

    delete(id: string): Promise<void>
}