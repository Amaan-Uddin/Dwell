import { Password } from "@/core/domain/auth/value-objects/Password"
import { describe, it, expect } from "vitest"

describe("Password value object", () => {
    it("empty password throws error", () => {
        expect(() => Password.validate("")).toThrow("Password cannot be empty.")
    })
    it("password without upper case throws error", () => {
        expect(() => Password.validate("johndoe123")).toThrow("Password must contain at least one upper case character.")
    })
    it("password without lower case throws error", () => {
        expect(() => Password.validate("JOHNDOE123")).toThrow("Password must contain at least one lower case character")
    })
    it("password without a number throws error", () => {
        expect(() => Password.validate("JOHNdoeman")).toThrow("Password must contain at least one number.")
    })
    it("short password throws error", () => {
        expect(() => Password.validate("John12")).toThrow("Password must be at least 8 characters long.")
    })
})
