import { describe, test, expect, beforeEach } from "vitest"
import { User, UserRoles } from "@/core/domain/auth/entities/User"
import { Email } from "@/core/domain/auth/value-objects/Email"
import { IPasswordHasher, Password } from "@/core/domain/auth/value-objects/Password"
import { randomUUID } from "crypto"

class PasswordHasher implements IPasswordHasher {
    hash(plainText: string): string {
        return `hash_${plainText}`
    }

    compare(plainText: string, hash: string): boolean {
        return hash == `hash_${plainText}`
    }

}

describe("Email value object", () => {
    test("empty string throws error", () => {
        expect(() => Email.create("")).toThrow()
    })
    test("no @ throws error", () => {
        expect(() => Email.create("johndoe.email.com")).toThrow()
    })
    test("multiple @ throws error", () => {
        expect(() => Email.create("john@doe@email.com")).toThrow()
    })
    test("only @ throws error", () => {
        expect(() => Email.create("@")).toThrow()
    })
    test("username with consecutive period throws error", () => {
        expect(() => Email.create("john..doe@email.com")).toThrow()
    })
    test("domain with consecutive period throws error", () => {
        expect(() => Email.create("johndoe@email..com")).toThrow()
    })
    test("username starts with number throws error", () => {
        expect(() => Email.create("1johndoe@email.com")).toThrow()
    })
    test("domain ends with number throws error", () => {
        expect(() => Email.create("johndoe@email.com1")).toThrow()
    })
    test("normalize email", () => {
        const email = Email.create("JohnDoe@email.Com")
        expect(email.value).toBe("johndoe@email.com")
    })
    test("mask email address", () => {
        const email = Email.create("JohnDoe@email.Com")
        expect(email.mask()).toBe("joh*****@email.com")
    })
})

describe("Password value object", () => {
    test("empty password throws error", () => {
        expect(() => Password.validate("")).toThrow("Password cannot be empty.")
    })
    test("password without upper case throws error", () => {
        expect(() => Password.validate("johndoe123")).toThrow("Password must contain at least one upper case character.")
    })
    test("password without lower case throws error", () => {
        expect(() => Password.validate("JOHNDOE123")).toThrow("Password must contain at least one lower case character")
    })
    test("password without a number throws error", () => {
        expect(() => Password.validate("JOHNdoeman")).toThrow("Password must contain at least one number.")
    })
    test("short password throws error", () => {
        expect(() => Password.validate("John12")).toThrow("Password must be at least 8 characters long.")
    })
})

describe("User Aggregate", () => {
    describe("Registered Users", () => {

        let email: Email
        let password: Password

        beforeEach(() => {
            const hasher = new PasswordHasher()

            email = Email.create("johndoe@email.com")
            password = Password.createFromHash(hasher.hash("johndoe123"))
        })

        test("create a valid user", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })

            expect(user.firstName).toBe("John")
            expect(user.email).toBe("johndoe@email.com")
            expect(user.isActive()).toBe(true)
            expect(user.role).toBe(UserRoles.USER)
        })

        test("throw when first name is missing", () => {
            const params = {
                firstName: "",
                email: email,
                password: password,
                role: UserRoles.USER
            }
            expect(() => User.create(params)).toThrow("First name must not be empty.")
        })
    })

    describe("Guest Users", () => {
        let guest: User
        let email: Email
        let password: Password
        beforeEach(() => {
            guest = User.createGuest(randomUUID().slice(0, 8))

            const hasher = new PasswordHasher()
            email = Email.create("janedoe@email.com")
            password = Password.createFromHash(hasher.hash("janedoe123"))
        })
        test("create a valid guest", () => {
            expect(guest.firstName).toBe("Guest")
            expect(guest.email).toBeUndefined()
            expect(guest.isGuest()).toBeTruthy()
        })

        test("promote guest to user", () => {
            guest.promoteGuestToUser({
                firstName: "Jane",
                lastName: "Doe",
                email: email,
                password: password
            })

            expect(guest.isUser()).toBeTruthy()
            expect(guest.email).toBe("janedoe@email.com")
        })
    })

    describe("user methods", () => {
        let email: Email
        let password: Password

        beforeEach(() => {
            const hasher = new PasswordHasher()

            email = Email.create("johndoe@email.com")
            password = Password.createFromHash(hasher.hash("johndoe123"))
        })

        test("promote user to admin", () => {
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

        test("demote admin to user", () => {
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

        test("soft delete user", () => {
            const user = User.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                password: password,
                role: UserRoles.USER
            })

            user.deleteUser()
            expect(user.status).toBe("DELETED")
            expect(user.isDeleted()).toBeTruthy()
        })
    })
})


