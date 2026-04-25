import { describe, it, expect, beforeEach, beforeAll } from "vitest"
import { User, UserRoles } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { Password } from "@/core/domain/auth/value-objects/Password"
import { PasswordHasher } from "../../utils/PasswordHasher"

describe("User Entity", () => {
    let email: Email
    let password: Password

    beforeAll(() => {
        const hasher = new PasswordHasher()
        email = Email.create("johndoe@email.com")
        password = Password.createFromHash(hasher.hash("JohnDoe123"))
    })

    describe("Registering user", () => {
        it("should create a valid use object", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })

            expect(user.fullName).toBe("John Doe")
            expect(user.email.value).toBe("johndoe@email.com")
            expect(user.isUser()).toBeTruthy()
            expect(user.isActive()).toBeTruthy()
            expect(user.isDeleted()).toBeFalsy()
        })

        it("should throw an error for missing firstName", () => {
            const params = {
                firstName: "",
                email: email,
                password: password,
                role: UserRoles.USER
            }
            expect(() => User.create(params)).toThrow("First name must not be empty.")
        })
    })

    describe("Guest users", () => {
        let guest: User
        beforeEach(() => {
            guest = User.createGuest({ id: "1" })
        })

        it("should create a valid guest user", () => {
            expect(guest.firstName).toBe("Guest")
            expect(guest.email.value).toBe("guest-1@hrp.guest")
            expect(guest.isGuest()).toBeTruthy()
        })

        it("should promote guest to an actual user", () => {
            guest.promoteGuestToUser({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password
            })

            expect(guest.isGuest()).toBeFalsy()
            expect(guest.isUser()).toBeTruthy()
            expect(guest.fullName).toBe("John Doe")
            expect(guest.email.value).toBe("johndoe@email.com")
        })
    })

    describe("User object methods", () => {
        it("should promote a user to an admin", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })
            expect(user.isUser()).toBeTruthy()

            user.promoteUserToAdmin()

            expect(user.isAdmin()).toBeTruthy()
        })

        it("should demote an admin to a user", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.ADMIN
            })
            expect(user.isAdmin()).toBeTruthy()

            user.demoteAdminToUser()

            expect(user.isUser()).toBeTruthy()
        })

        it("should soft deletes a user", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })

            user.deleteUser()
            expect(user.isActive()).toBeFalsy()
            expect(user.isDeleted()).toBeTruthy()
        })
    })
})


