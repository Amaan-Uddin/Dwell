enum HouseStatus {
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
        createdBy: string
    }): House {
        if (!params.name || params.name.trim().length === 0) {
            throw new Error("House must have a name.")
        }

        if (!params.createdBy || params.createdBy.trim().length === 0) {
            throw new Error("Creator of house must be provided.")
        }

        const now = new Date()

        return new House({
            id: crypto.randomUUID(),
            name: params.name.trim(),
            description: params.description?.trim() || undefined,
            ownedBy: params.createdBy,
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
        if (!newName || newName.trim().length == 0) {
            throw new Error("Provide new name.")
        }
        this.props.name = newName.trim()
        this.markAsUpdated()
    }

    updateDescription(newDescription: string): void {
        if (!newDescription || newDescription.trim().length === 0) {
            this.props.description = undefined
        } else {
            this.props.description = newDescription.trim()
        }
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
}