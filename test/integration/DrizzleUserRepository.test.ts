import { describe, expect, beforeAll, beforeEach, it } from "vitest"
import { db } from "../setup"
import { DrizzleUserRepository } from "@/core/infrastructure/persistence/drizzle/repositories/DrizzleUserRepository"
import { User, UserRoles } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { Password } from "@/core/domain/auth/value-objects/Password"
import { PasswordHasher } from "../utils/PasswordHasher"
import { user as UserTb } from "@/db/schema"

describe("Drizzle User Repository", () => {
    let userRepo: DrizzleUserRepository
    let email: Email
    let password: Password

    beforeAll(async () => {
        userRepo = new DrizzleUserRepository(db)
        const hasher = new PasswordHasher()
        email = Email.create("johndoe@email.com")
        password = Password.createFromHash(hasher.hash("JohnDoe123"))
    })

    beforeEach(async () => {
        await db.delete(UserTb)
    })

    describe("User in db", () => {
        let user: User

        beforeEach(() => {
            user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })
        })

        it("should return user after insert", async () => {
            const response = await userRepo.save(user)
            console.log("saved user after insert", response)

            expect(response.fullName).toBe("John Doe")
            expect(response.email.value).toBe("johndoe@email.com")
        })

        it("should match the saved user after fetching", async () => {
            const { id, fullName, email } = await userRepo.save(user)
            console.log("saved user ID:", id)

            const fetchUser = await userRepo.findById(id)
            console.log("fetched user", fetchUser)

            expect(fetchUser).toBeTruthy()
            expect(fetchUser?.id).toBe(id)
            expect(fetchUser?.fullName).toBe(fullName)
            expect(fetchUser?.email.value).toBe(email.value)
        })

        it("should return a null value for no user in db", async () => {
            const fetchUser = await userRepo.findById("none")
            console.log("fetch user:", fetchUser)

            expect(fetchUser).toBeNull()
        })
    })
})