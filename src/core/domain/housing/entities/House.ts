import { randomUUID } from "crypto"

export enum HouseStatus {
    ACTIVE = "ACTIVE",
    ABANDONED = "ABANDONED",
    ARCHIVED = "ARCHIVED"
}

export interface HouseProps {
    id: string
    name: string
    description: string | null
    ownedBy: string
    status: HouseStatus
    createdAt: Date
    updatedAt: Date
    abandonedAt: Date | null
    archivedAt: Date | null
}

export class House {
    private constructor(private props: HouseProps) { }

    static create(params: {
        name: string,
        description?: string
        ownedBy: string
    }): House {
        if (!params.name?.trim()) {
            throw new Error("House name cannot be empty.")
        }

        if (!params.ownedBy?.trim()) {
            throw new Error("Owner must not be empty.")
        }

        const now = new Date()

        return new House({
            id: randomUUID(),
            name: params.name,
            description: params.description ?? null,
            ownedBy: params.ownedBy,
            status: HouseStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            abandonedAt: null,
            archivedAt: null
        })
    }

    static reconstitute(props: HouseProps): House {
        return new House(props)
    }

    toObject(): HouseProps {
        return { ...this.props }
    }

    get id(): string {
        return this.props.id
    }

    get name(): string {
        return this.props.name
    }

    get description(): string | null {
        return this.props.description
    }

    get ownedBy(): string {
        return this.props.ownedBy
    }

    get status(): string {
        return this.props.status
    }

    get createdAt(): Date {
        return this.props.createdAt
    }

    get updatedAt(): Date {
        return this.props.updatedAt
    }

    get abandonedAt(): Date | null {
        return this.props.abandonedAt
    }

    get archivedAt(): Date | null {
        return this.props.archivedAt
    }

    isActive(): boolean {
        return this.props.status === HouseStatus.ACTIVE
    }
    isAbandoned(): boolean {
        return this.props.status === HouseStatus.ABANDONED
    }
    isArchived(): boolean {
        return this.props.status === HouseStatus.ARCHIVED
    }

    updateName(newName: string): void {
        if (!newName?.trim()) {
            throw new Error("New house name cannot be empty.")
        }
        this.props.name = newName
        this.markAsUpdated()
    }

    updateDescription(newDescription: string): void {
        if (!newDescription?.trim()) {
            throw new Error("New description must not be empty.")
        }

        this.props.description = newDescription
        this.markAsUpdated()
    }

    private markAsUpdated(date: Date = new Date()): void {
        this.props.updatedAt = date
    }

    updateStatusToAbandoned(): void {
        if (this.isAbandoned()) {
            throw new Error("House is already abandoned.")
        }
        if (this.isArchived()) {
            throw new Error("Cannot abandon archived house.")
        }

        const now = new Date()
        this.props.status = HouseStatus.ABANDONED
        this.props.abandonedAt = now
        this.markAsUpdated(now)
    }
    updateStatusToArchived(): void {
        if (this.isArchived()) {
            throw new Error("House is already archived.")
        }
        if (this.isActive()) {
            throw new Error("Cannot archive active house.")
        }

        const now = new Date()
        this.props.status = HouseStatus.ARCHIVED
        this.props.archivedAt = now
        this.markAsUpdated(now)
    }
    updateStatusToActive(): void {
        if (this.isActive()) {
            throw new Error("House is already active.")
        }

        this.props.status = HouseStatus.ACTIVE
        this.markAsUpdated()
    }

    transferOwnership(currentOwner: string, newOwner: string): void {
        if (this.isAbandoned() || this.isArchived()) {
            throw new Error("House must be active before transferring ownership.")
        }

        if (!currentOwner?.trim()) {
            throw new Error("Current owner must be provided for transferring of ownership")
        }

        if (!newOwner?.trim()) {
            throw new Error("New owner must be provided for transferring of ownership.")
        }

        if (currentOwner !== this.ownedBy) {
            throw new Error("Current owner mismatch.")
        }

        if (newOwner === this.ownedBy) {
            throw new Error("User already is the owner.")
        }

        this.props.ownedBy = newOwner
        this.markAsUpdated()
    }
}