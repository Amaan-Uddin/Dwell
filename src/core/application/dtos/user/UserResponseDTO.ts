export interface UserResponseDTO {
    id: string
    firstName?: string
    lastName?: string
    fullName: string
    email: string
    externalAuthId?: string
    status?: string
    role?: string
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date | null
} 