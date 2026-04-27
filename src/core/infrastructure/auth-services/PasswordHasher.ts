import { IPasswordHasher } from "@/core/domain/auth/value-objects/Password"
import bcrypt from "bcrypt"

export class PasswordHasher implements IPasswordHasher {
    async hash(plainText: string): Promise<string> {
        const salt = await bcrypt.genSalt(15)
        return await bcrypt.hash(plainText, salt)
    }
    async compare(plainText: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(plainText, hash)
    }
}