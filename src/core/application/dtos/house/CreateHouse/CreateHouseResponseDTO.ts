export interface CreateHouseResponseDTO {
    id: string
    name: string
    description: string | null
    ownedBy: string
    status: string
    createdAt: Date
    updatedAt: Date
}