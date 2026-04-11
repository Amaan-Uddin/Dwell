export enum HouseStatus {
    ACTIVE = "ACTIVE",
    ABANDONED = "ABANDONED",
    ARCHIVED = "ARCHIVED"
}

export interface HouseProps {
    id: string
    name: string
    description?: string
    ownedBy: string
    status: HouseStatus
    createdAt: Date
    updatedAt: Date
}

export class House {
    private constructor(private props: HouseProps) { }

    static create(params: {
        name: string,
        description?: string
        ownedBy: string
    }): House {
        if (!params.name?.trim()) {
            throw new Error("House name must not be empty.")
        }

        if (!params.ownedBy?.trim()) {
            throw new Error("Owner must not be empty.")
        }

        const now = new Date()

        return new House({
            id: crypto.randomUUID(),
            name: params.name,
            description: params.description,
            ownedBy: params.ownedBy,
            status: HouseStatus.ACTIVE,
            createdAt: now,
            updatedAt: now
        })
    }

    static reconstitute(props: HouseProps): House {
        return new House(props)
    }

    get id(): string {
        return this.props.id
    }

    get name(): string {
        return this.props.name
    }

    get description(): string | undefined {
        return this.props.description
    }

    get ownedBy(): string {
        return this.props.ownedBy
    }

    get status(): string {
        return this.props.status
    }

    // Business Query methods
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

    private markAsUpdated(): void {
        this.props.updatedAt = new Date()
    }

    updateStatusToAbandoned(): void {
        if (this.isAbandoned()) {
            throw new Error("House is already abandoned.")
        }
        if (this.isArchived()) {
            throw new Error("Cannot abandon archived house.")
        }

        this.props.status = HouseStatus.ABANDONED
        this.markAsUpdated()
    }
    updateStatusToArchived(): void {
        if (this.isArchived()) {
            throw new Error("House is already archived.")
        }
        if (this.isActive()) {
            throw new Error("Cannot archive active house.")
        }

        this.props.status = HouseStatus.ARCHIVED
        this.markAsUpdated()
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