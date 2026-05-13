import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest"
import { ClerkService } from "@/core/infrastructure/auth-services/clerk/ClerkService"
import { createClerkClient, User as ClerkUser } from "@clerk/backend"
import { User, UserRoles } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { Password } from "@/core/domain/auth/value-objects/Password"

describe("Clerk Services", () => {
    let clerkService: ClerkService
    let user: User

    beforeAll(() => {
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
        clerkService = new ClerkService(clerkClient)

        user = User.create({
            firstName: "John",
            lastName: "Doe",
            email: Email.create("johndoe@email.com"),
            password: Password.create("SomeReallyLongJohnDoePass@123"),
            role: UserRoles.USER
        })
    })


    describe("Clerk create methods", () => {
        let userId: string

        afterEach(async () => {
            await clerkService.deleteUser(userId)
        })

        it("should create a user in clerk", async () => {
            const clerkUser = await clerkService.createUser(user)
            console.log(clerkUser)
            userId = clerkUser.id

            expect(clerkUser.fullName).toBe("John Doe")
            expect(clerkUser.emailAddresses[0].emailAddress).toBe("johndoe@email.com")
        })

    })


    describe.only("Clerk update methods", () => {
        let clerkUser: ClerkUser
        let userId: string
        beforeEach(async () => {
            clerkUser = await clerkService.createUser(user)
            userId = clerkUser.id
            user.updateExternalAuthId({ externalAuthId: clerkUser.id })
        })
        afterEach(async () => {
            await clerkService.deleteUser(userId)
        })

        it("should update user first and last name in clerk", async () => {
            user.updateProfile({ firstName: "Jane", lastName: "Snow" })
            console.log("user details updated", user)

            const updatedClerkUser = await clerkService.updateUserFirstAndLastName(user)
            console.log("updated clerk user", updatedClerkUser)

            expect(updatedClerkUser.firstName).toBe("Jane")
            expect(updatedClerkUser.lastName).toBe("Snow")
            expect(updatedClerkUser.fullName).toBe("Jane Snow")
        })

        it("should update user email address in clerk", async () => {
            user.updateEmail({ email: Email.create("johndoe121312@email.com") })
            console.log("user details updated", user)

            const updatedClerkUser = await clerkService.updateUserEmailAddress(user)
            console.log("updated clerk user", updatedClerkUser)

            expect(updatedClerkUser.emailAddresses[0].emailAddress).toBe("johndoe121312@email.com")
        })

    })

})