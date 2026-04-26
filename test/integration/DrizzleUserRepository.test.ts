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
    let hasher: PasswordHasher

    beforeAll(async () => {
        userRepo = new DrizzleUserRepository(db)
        hasher = new PasswordHasher()
    })

    beforeEach(async () => {
        await db.delete(UserTb)
    })

    describe("Inserting user to db", () => {
        let user: User

        beforeEach(() => {
            email = Email.create("johndoe@email.com")
            password = Password.createFromHash(hasher.hash("JohnDoe123"))

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
            const fetchUser = await userRepo.findById(crypto.randomUUID())
            console.log("fetch user:", fetchUser)

            expect(fetchUser).toBeNull()
        })
    })

    describe("Multiple users in db", () => {
        let data
        let userMap: User[]
        // let savedMap
        beforeEach(async () => {
            data = [
                {
                    firstName: "John",
                    email: "johndoe@email.com",
                    password: "Johndoe123",
                    role: UserRoles.USER
                },
                {
                    firstName: "Jane",
                    email: "janedoe@email.com",
                    password: "Janedoe123",
                    role: UserRoles.USER
                },
                {
                    firstName: "Jack",
                    email: "jackdoe@email.com",
                    password: "Jackdoe123",
                    role: UserRoles.ADMIN
                },
                {
                    firstName: undefined,
                    email: undefined,
                    password: undefined,
                    role: UserRoles.GUEST
                },
                {
                    firstName: undefined,
                    email: undefined,
                    password: undefined,
                    role: UserRoles.GUEST
                }
            ]

            userMap = data.map((item) => {
                if (!item.firstName && !item.email) return User.createGuest()
                else return User.create({
                    firstName: item.firstName,
                    email: Email.create(item.email),
                    password: Password.createFromHash(hasher.hash(item.password)),
                    role: item.role
                })
            })

            userMap.forEach(async (user) => {
                await userRepo.save(user)
            })
            console.log(userMap)
        })


        it("should fetch all active users", async () => {
            const response = await userRepo.findActiveUsers()
            console.log("response to fetching active users:", response)

            expect(response.length).toBe(userMap.length)
        })

        it("should fetch all admin users", async () => {
            const response = await userRepo.findByRole(UserRoles.ADMIN)
            console.log("response to fetching all admin users:", response)

            expect(response.length).toBe(1)
        })

        it("should fetch all guest users", async () => {
            const response = await userRepo.findByRole(UserRoles.GUEST)
            console.log("response to fetching all guest users:", response)

            expect(response.length).toBe(2)
        })

        it("should fetch all soft deleted users", async () => {
            const user1 = userMap[0]
            const user2 = userMap[1]

            user1.deleteUser()
            user2.deleteUser()

            await userRepo.delete(user1)
            await userRepo.delete(user2)

            const response = await userRepo.findDeletedUsers()
            console.log("response after fetching soft deleted users:", response)

            expect(response.length).toBe(2)
        })
    })

    describe.only("Throwing errors", () => {
        it("should throw an error for passing empty id string", async () => {
            await expect(userRepo.findById("")).rejects.toThrow()
        })
        it("should throw an error for passing empty email string", async () => {
            await expect(userRepo.findByEmail("")).rejects.toThrow()
        })
        it("should throw an error for passing empty role string", async () => {
            await expect(userRepo.findByRole("" as UserRoles)).rejects.toThrow()
        })
        it("should not throw error for no data in db", async () => {
            // there is no data in db for this test
            expect((await userRepo.findActiveUsers()).length).toBe(0)
        })
        it("should throw an error when no user is provided", async () => {
            await expect(userRepo.save({} as User)).rejects.toThrow()
        })
    })
})