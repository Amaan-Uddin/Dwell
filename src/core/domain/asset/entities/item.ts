export enum ItemStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED"
}
export interface ItemProps {
    id: string
    name: string
    status: ItemStatus
    count: number
    inventoryId: string
    createdAt: Date
    updatedAt: Date
}

export class Item {
    private constructor(private props: ItemProps) { }

    static create(params: {
        name: string,
        inventoryId: string
    }): Item {
        if (!params.name.trim()) throw new Error("Item name is required.")
        if (!params.inventoryId.trim()) throw new Error("Item requires an inventory.")

        const normalizedName = params.name.trim().replace(/\s+g/, " ")
        const now = new Date()

        return new Item({
            id: crypto.randomUUID(),
            name: normalizedName,
            status: ItemStatus.ACTIVE,
            count: 0,
            inventoryId: params.inventoryId,
            createdAt: now,
            updatedAt: now
        })
    }

    static reconstitute(props: ItemProps): Item {
        return new Item(props)
    }

    toObject(): ItemProps {
        return { ...this.props }
    }

    private markAsUpdated(date: Date = new Date()): void {
        this.props.updatedAt = date
    }

    private normalizeName(name: string) {
        return name.trim().replace(/\s+g/, " ")
    }

    get id(): string {
        return this.props.id
    }
    get name(): string {
        return this.props.name
    }
    get status(): string {
        return this.props.status
    }
    get count(): number {
        return this.props.count
    }
    get inventoryId(): string {
        return this.props.inventoryId
    }
    get createdAt(): Date {
        return this.props.createdAt
    }
    get updatedAt(): Date {
        return this.props.updatedAt
    }

    isActive(): boolean {
        return this.props.status === ItemStatus.ACTIVE
    }
    isArchived(): boolean {
        return this.props.status === ItemStatus.ARCHIVED
    }

    rename(newName: string): void {
        if (!newName.trim()) throw new Error("New name is required for renaming.")
        const normalizedName = this.normalizeName(newName)
        this.props.name = normalizedName
        this.markAsUpdated()
    }

    archive(): void {
        if (this.isArchived()) throw new Error("Item is already archived.")
        this.props.status = ItemStatus.ARCHIVED
        this.markAsUpdated()
    }

    restore(): void {
        if (this.isActive()) throw new Error("Item is already active.")
        this.props.status = ItemStatus.ACTIVE
        this.markAsUpdated()
    }

    changeCount(delta: number): void {
        if (delta == 0) throw new Error("Quantity cannot be 0.")

        const newCount = this.count + delta
        if (newCount < 0) throw new Error(`Cannot reduce quantity below 0 (current qty: ${this.count}, change: ${delta}).`)

        this.props.count = newCount
        this.markAsUpdated()
    }
}