export enum AuditActionType {
    ADDED = "ADDED",
    CONSUMED = "CONSUMED",
    RECONCILED = "RECONCILED",
    EXPIRED = "EXPIRED",
}

export interface AuditProps {
    id: string,
    eventNumber: number,
    residentId: string,
    itemId: string,
    inventoryId: string,
    actionType: AuditActionType,
    delta: number,
    metadata: Record<string, unknown> | null,
    createdAt: Date
}

export type AuditMetadata = Record<string, unknown>

export class Audit {
    private constructor(private props: AuditProps) { }

    static create(params: {
        residentId: string,
        itemId: string,
        inventoryId: string,
        actionType: AuditActionType,
        delta: number,
        metadata?: Record<string, unknown>
    }): Audit {
        if (!params.residentId?.trim()) throw new Error("User ID is required to create an audit.")
        if (!params.itemId?.trim()) throw new Error("Item ID is required to create an audit.")
        if (!params.inventoryId?.trim()) throw new Error("Inventory ID is required to create an audit.")

        if (!Object.values(AuditActionType).includes(params.actionType as AuditActionType)) throw new Error("Invalid audit event received.")
        if (params.delta === 0) throw new Error("Audit delta cannot be 0, an event must modify stock level.")

        return new Audit({
            id: crypto.randomUUID(),
            eventNumber: 0, // this is a default placeholder for the eventNumber upon audit creation, this done so that the eventNumber type remain number which we get from postgres, but on the server side the default placeholder value for it is 0. This never gets sent to the db.
            residentId: params.residentId,
            itemId: params.itemId,
            inventoryId: params.inventoryId,
            actionType: params.actionType,
            delta: params.delta,
            metadata: params.metadata ?? null,
            createdAt: new Date()
        })
    }

    static reconstitute(props: AuditProps): Audit {
        return new Audit(props)
    }

    toObject(): AuditProps {
        return { ...this.props }
    }

    get id(): string {
        return this.props.id
    }
    get eventNumber(): number {
        return this.props.eventNumber
    }
    get residentId(): string {
        return this.props.residentId
    }
    get itemId(): string {
        return this.props.itemId
    }
    get inventoryId(): string {
        return this.props.inventoryId
    }
    get actionType(): AuditActionType {
        return this.props.actionType
    }
    get delta(): number {
        return this.props.delta
    }
    get metadata(): Record<string, unknown> | null {
        return this.props.metadata
    }
    get createdAt(): Date {
        return this.props.createdAt
    }

    isAdded(): boolean {
        return this.props.actionType === AuditActionType.ADDED
    }
    isConsumed(): boolean {
        return this.props.actionType === AuditActionType.CONSUMED
    }
    isReconciled(): boolean {
        return this.props.actionType === AuditActionType.RECONCILED
    }
    isExpired(): boolean {
        return this.props.actionType === AuditActionType.EXPIRED
    }
}