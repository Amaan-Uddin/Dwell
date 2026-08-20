import { User } from "@/core/domain/auth/entities/User"

export function assertUserExists(user: User | null): asserts user is User {
    if (!user) throw new Error("User not found.", { cause: "USER_NOT_FOUND" })
}

export function assertUserIsNotDeleted(user: User): void {
    if (user.isDeleted()) throw new Error("User account is deleted.", { cause: "USER_DELETED" })
}

export function assertUserIsNotGuest(user: User): void {
    if (user.isGuest()) throw new Error("Guest users cannot join houses.", { cause: "GUEST_USER" })
}