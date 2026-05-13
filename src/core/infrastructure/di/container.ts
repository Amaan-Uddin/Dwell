import { RegisterUser } from "@/core/application/use-cases/user/RegisterUser"
import { DrizzleUserRepository } from "../persistence/drizzle/repositories/DrizzleUserRepository"
import { PasswordHasher } from "../auth-services/PasswordHasher"
import { db } from "@/db"
import { DeleteUser } from "@/core/application/use-cases/user/DeleteUser"
import { CreateGuest } from "@/core/application/use-cases/user/CreateGuest"
import { SessionService } from "../persistence/drizzle/services/DrizzleSessionService"
import { GetUser } from "@/core/application/use-cases/user/GetUser"
import { createClerkClient } from "@clerk/backend"
import { ClerkService } from "../auth-services/clerk/ClerkService"

const hasher = new PasswordHasher()
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export const userRepository = new DrizzleUserRepository(db)
export const sessionService = new SessionService(db)
export const clerkService = new ClerkService(clerkClient)

export const registerUserUseCase = new RegisterUser(userRepository, hasher)
export const deleteUserUseCase = new DeleteUser(userRepository)
export const createGuestUseCase = new CreateGuest(userRepository, sessionService)
export const getUserUseCase = new GetUser(userRepository, sessionService)