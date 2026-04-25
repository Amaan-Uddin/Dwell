import { describe, it, expect } from "vitest"
import { Email } from "@/core/domain/auth/value-objects/Email"

describe("Email value object", () => {
    it("empty string throws error", () => {
        expect(() => Email.create("")).toThrow()
    })
    it("no @ throws error", () => {
        expect(() => Email.create("johndoe.email.com")).toThrow()
    })
    it("multiple @ throws error", () => {
        expect(() => Email.create("john@doe@email.com")).toThrow()
    })
    it("only @ throws error", () => {
        expect(() => Email.create("@")).toThrow()
    })
    it("username with consecutive period throws error", () => {
        expect(() => Email.create("john..doe@email.com")).toThrow()
    })
    it("domain with consecutive period throws error", () => {
        expect(() => Email.create("johndoe@email..com")).toThrow()
    })
    it("username starts with number throws error", () => {
        expect(() => Email.create("1johndoe@email.com")).toThrow()
    })
    it("domain ends with number throws error", () => {
        expect(() => Email.create("johndoe@email.com1")).toThrow()
    })
    it("normalize email", () => {
        const email = Email.create("JohnDoe@email.Com")
        expect(email.value).toBe("johndoe@email.com")
    })
    it("mask email address", () => {
        const email = Email.create("JohnDoe@email.Com")
        expect(email.mask()).toBe("joh*****@email.com")
    })
})
