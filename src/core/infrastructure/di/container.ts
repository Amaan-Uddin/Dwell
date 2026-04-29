import { RegisterUser } from "@/core/application/use-cases/user/RegisterUser"
import { DrizzleUserRepository } from "../persistence/drizzle/repositories/DrizzleUserRepository"
import { PasswordHasher } from "../auth-services/PasswordHasher"
import { db } from "@/db"
import { DeleteUser } from "@/core/application/use-cases/user/DeleteUser"

const hasher = new PasswordHasher()

export const userRepository = new DrizzleUserRepository(db)
export const registerUserUseCase = new RegisterUser(userRepository, hasher)
export const deleteUserUseCase = new DeleteUser(userRepository)