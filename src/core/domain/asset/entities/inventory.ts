export interface InventoryProps {
    id: string
    houseId: string
    createdAt: Date
    updatedAt: Date
}

export class Inventory {
    private constructor(private props: InventoryProps) { }

    static create(params: {
        houseId: string
    }): Inventory {
        if (!params.houseId.trim()) throw new Error("Inventory requires a house.")

        const now = new Date()

        return new Inventory({
            id: crypto.randomUUID(),
            houseId: params.houseId,
            createdAt: now,
            updatedAt: now
        })
    }

    static reconstitute(props: InventoryProps): Inventory {
        return new Inventory(props)
    }

    toObject(): InventoryProps {
        return { ...this.props }
    }

    get id(): string {
        return this.props.id
    }
    get houseId(): string {
        return this.props.houseId
    }
    get createdAt(): Date {
        return this.props.createdAt
    }
    get updatedAt(): Date {
        return this.props.updatedAt
    }

}