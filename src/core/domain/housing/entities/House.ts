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
        if (!params.name || params.name.trim().length == 0) {
            throw new Error("House must have a name.")
        }

        if (!params.createdBy || params.createdBy.trim().length == 0) {
            throw new Error("Creator of house must be provided.")
        }

        const now = new Date()

        return new House({
            id: crypto.randomUUID(),
            name: params.name,
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

}