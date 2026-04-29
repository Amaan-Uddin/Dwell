export interface RegisterUserResponseDTO {
    id: string
    fullName: string
    email: string
    createdAt: Date
    updatedAt: Date
}

export interface DeleteUserResponseDTO {
    id: string
    status: string
    deletedAt: Date
}