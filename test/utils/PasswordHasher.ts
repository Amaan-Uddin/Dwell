import { IPasswordHasher } from "@/core/domain/auth/value-objects/Password";

export class PasswordHasher implements IPasswordHasher {
    hash(plainText: string): string {
        return `hash_${plainText}`
    }

    compare(plainText: string, hash: string): boolean {
        return hash === `hash_${plainText}`
    }
}