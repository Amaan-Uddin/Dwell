export enum ResidentRole {
    OWNER = "OWNER",
    MEMBER = "MEMBER"
}

export enum ResidentStatus {
    ACTIVE = "ACTIVE",
    LEFT = "LEFT",
    REMOVED = "REMOVED"
}

export interface ResidentProps {
    id: string,
    userId: string,
    houseId: string,
    status: ResidentStatus
    role: ResidentRole,
    rejoinedCount: number,
    leftAt?: Date,
    removedAt?: Date,
    createdAt: Date,
    updatedAt: Date
}

export class Resident {
    private constructor(private props: ResidentProps) { }

    static create(params: {
        userId: string,
        houseId: string,
        role?: string
    }) {
        if (!params.userId?.trim()) {
            throw new Error("User ID must not be empty.")
        }

        if (!params.houseId?.trim()) {
            throw new Error("House ID must not be empty.")
        }

        if (params.role && !Object.values(ResidentRole).includes(params.role as ResidentRole)) {
            throw new Error("Invalid resident role.")
        }

        const now = new Date()

        return new Resident({
            id: crypto.randomUUID(),
            userId: params.userId,
            houseId: params.houseId,
            status: ResidentStatus.ACTIVE,
            role: params.role as ResidentRole,
            rejoinedCount: 0,
            createdAt: now,
            updatedAt: now
        })
    }

}