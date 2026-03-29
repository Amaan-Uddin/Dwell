export class Email {
    private constructor(private readonly email: string) { }

    // factory method for creating our class object
    static create(value: string): Email {
        this.validate(value)
        const normalizedEmail = this.normalize(value)
        return new Email(normalizedEmail)
    }

    private static validate(address: string): void {
        // whitespace check
        if (address.length !== address.trim().length) {
            throw new Error("Email must not contain whitespaces.")
        }

        // @ symbol check
        if (!address.includes("@")) {
            throw new Error("Missing '@' symbol from email address.")
        }

        // check if there are more than 1 @ symbol in the email address
        if (this.getCharacterCount(address, "@") !== 1) {
            throw new Error("Email must not contain more than one '@' symbol.")
        }

        const [local, domain] = address.split("@")

        // check if local and domain part of the email address is empty or not
        if (!local.trim() || !domain.trim()) {
            throw new Error("Invalid email address.")
        }

        // check the length of local and domain part of the email address and also the total length of the email address
        if (local.length > 64) {
            throw new Error("Email username is too long (maximum 64 characters).")
        }
        if (domain.length > 255) {
            throw new Error("Email domain name is too long (maximum 255 characters).")
        }
        if ((local.length + 1 + domain.length) > 254) {
            throw new Error("Email address is too long (maximum 254 characters).")
        }

        // check for consecutive periods in the local and domain part of the email address
        if (this.hasConsecutivePeriodTrail(local)) {
            throw new Error("Email username cannot have consecutive trailing periods.")
        }
        if (this.hasConsecutivePeriodTrail(domain)) {
            throw new Error("Email domain cannot have consecutive trailing periods.")
        }

        // check for the presence of at least 1 period in the domain part of the email address and also check for the presence of underscore character in the domain part of the email address
        if (this.getCharacterCount(domain, ".") < 1) {
            throw new Error("Email domain must contain at least 1 '.' period.")
        }
        if (domain.includes("_")) {
            throw new Error("Email domain must not contain '_' underscore character.")
        }

        if (this.startsWithNumber(local)) {
            throw new Error("Email username cannot start with a number.")
        }
        if (this.endsWithNumber(domain)) {
            throw new Error("Email domain cannot end with a number.")
        }

    }

    private static getCharacterCount(text: string, character: string): number {
        // splitting the text by a single character will give us an array of strings which were broken at those character
        return text.split(character).length - 1
    }
    private static hasConsecutivePeriodTrail(text: string): boolean {
        // regular expression that checks whether our string have trailing periods or not
        const regex = /\.{2,}/
        return regex.test(text)
    }
    private static startsWithNumber(text: string): boolean {
        // check if the first character of an email name starts with a number
        const regex = /^\d/
        return regex.test(text)
    }
    private static endsWithNumber(text: string): boolean {
        // check if the last character of the email is a number 
        const regex = /\d$/
        return regex.test(text)
    }

    private static normalize(address: string): string {
        return address.toLowerCase()
    }

    static reconstitute(email: string): Email {
        return new Email(email)
    }

    get value(): string {
        return this.email
    }

    mask(): string {
        const [local, domain] = this.email.split("@") // the value is validated as the only way to create an Email object is through the factory method
        const localPart = local.length > 3 ? local.slice(0, 3) : local[0]
        return `${localPart}*****@${domain}`
    }
}