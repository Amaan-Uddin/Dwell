export interface IPasswordHasher {
    hash(plainText: string): string | Promise<string>
    compare(plainText: string, hash: string): boolean | Promise<boolean>
}

export class Password {
    private constructor(private readonly hashValue: string) { }

    /**
     * @deprecated Use `createFromHash()` method which accepts a hash string
     */
    static async create(value: string, hasher: IPasswordHasher): Promise<Password> {
        this.validate(value)
        const hashedValue = await hasher.hash(value)
        return new Password(hashedValue)
    }

    static createFromHash(hash: string): Password {
        return new Password(hash)
    }

    static validate(value: string): void {
        if (!value || value.trim().length == 0) {
            throw new Error("Password cannot be empty.")
        }
        if (value.length !== value.trim().length) {
            throw new Error("Passwords must not contain white spaces.")
        }

        if (value.length < 8) {
            throw new Error("Password must be at least 8 characters long.")
        }

        if (!/[A-Z]/.test(value)) {
            throw new Error("Password must contain at least one upper case character.")
        }
        if (!/[a-z]/.test(value)) {
            throw new Error("Password must contain at least one lower case character")
        }
        if (!/[0-9]/.test(value)) {
            throw new Error("Password must contain at least one number.")
        }
    }

    static reconstitute(hash: string): Password {
        return new Password(hash)
    }

    /**
     * @deprecated method no long in use
     */
    async verify(value: string, hasher: IPasswordHasher): Promise<boolean> {
        return await hasher.compare(value, this.hashValue)
    }

    get value(): string {
        return this.hashValue
    }
}