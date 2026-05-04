export interface GetUserResponseDTO {
    id: string
    email: string
    firstName: string
    lastName: string | null
    fullName: string
    status: string
    role: string
    createdAt: Date
    updatedAt: Date
}