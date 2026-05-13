export interface IPasswordHasher {
    hash(plainText: string): string | Promise<string>
    compare(plainText: string, hash: string): boolean | Promise<boolean>
}

export class Password {
    private constructor(private readonly hashOrText: string) { }

    static create(value: string): Password {
        this.validate(value)
        return new Password(value)
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

    static reconstitute(hashOrText: string): Password {
        return new Password(hashOrText)
    }

    get value(): string {
        return this.hashOrText
    }
}