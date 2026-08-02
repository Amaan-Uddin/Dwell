import { randomUUID } from "crypto"

export enum ResidentStatus {
    ACTIVE = "ACTIVE",
    LEFT = "LEFT",
    REMOVED = "REMOVED"
}

export enum RemoveStatus {
    TEMP = "TEMP",
    PERM = "PERM"
}

export enum ResidentRole {
    OWNER = "OWNER",
    MEMBER = "MEMBER"
}

export interface ResidentProps {
    id: string
    userId: string
    houseId: string
    status: ResidentStatus
    role: ResidentRole
    removeStatus: RemoveStatus | null
    rejoinedCount: number
    createdAt: Date
    updatedAt: Date
    leftAt: Date | null
    removedAt: Date | null
}

export class Resident {
    private constructor(private props: ResidentProps) { }

    static create(params: {
        userId: string,
        houseId: string,
        role: ResidentRole
    }) {
        if (!params.userId?.trim()) {
            throw new Error("User ID must not be empty.")
        }

        if (!params.houseId?.trim()) {
            throw new Error("House ID must not be empty.")
        }

        const now = new Date()

        return new Resident({
            id: randomUUID(),
            userId: params.userId,
            houseId: params.houseId,
            status: ResidentStatus.ACTIVE,
            role: params.role,
            removeStatus: null,
            rejoinedCount: 0,
            createdAt: now,
            updatedAt: now,
            leftAt: null,
            removedAt: null
        })
    }

    // reconstitute the resident object from persistence
    static reconstitute(props: ResidentProps) {
        return new Resident(props)
    }

    toObject(): ResidentProps {
        return { ...this.props }
    }

    get id(): string {
        return this.props.id
    }

    get userId(): string {
        return this.props.userId
    }

    get houseId(): string {
        return this.props.houseId
    }

    get status(): ResidentStatus {
        return this.props.status
    }

    get role(): ResidentRole {
        return this.props.role
    }

    get removeStatus(): RemoveStatus | null {
        return this.props.removeStatus
    }

    get createdAt(): Date {
        return this.props.createdAt
    }

    get updatedAt(): Date {
        return this.props.updatedAt
    }

    get leftAt(): Date | null {
        return this.props.leftAt
    }

    get removedAt(): Date | null {
        return this.props.removedAt
    }

    isOwner(): boolean {
        return this.props.role === ResidentRole.OWNER
    }

    isMember(): boolean {
        return this.props.role === ResidentRole.MEMBER
    }

    isActive(): boolean {
        return this.props.status === ResidentStatus.ACTIVE
    }

    hasLeft(): boolean {
        return this.props.status === ResidentStatus.LEFT
    }

    isRemoved(): boolean {
        return this.props.status === ResidentStatus.REMOVED
    }

    private markAsUpdated(date: Date = new Date()): void {
        this.props.updatedAt = date
    }

    leave(): void {
        if (this.hasLeft()) {
            throw new Error("User has already left the house.")
        }

        if (this.isRemoved()) {
            throw new Error("User has already been removed.")
        }

        const now = new Date()

        this.props.status = ResidentStatus.LEFT
        this.props.leftAt = now
        this.markAsUpdated(now)
    }

    remove(status: RemoveStatus = RemoveStatus.TEMP): void {
        if (this.isRemoved()) {
            throw new Error("User has already been removed.")
        }

        if (this.hasLeft()) {
            throw new Error("User has already left the house.")
        }

        const now = new Date()

        this.props.status = ResidentStatus.REMOVED
        this.props.removeStatus = status
        this.props.removedAt = now
        this.markAsUpdated(now)
    }

    rejoin(): void {
        if (this.isActive()) {
            throw new Error("User is already active.")
        }

        if (this.isRemoved()) {
            // if the user was removed permanently we then never allow the user to rejoin
            if (this.removeStatus === RemoveStatus.PERM) {
                throw new Error("User has been permanently banned from the house.")
            }

            // if the user was removed temporarily we check the days which has passed since users removal to see if they are allowed to rejoin a house
            if (this.removeStatus === RemoveStatus.TEMP) {
                const now = new Date()
                const differenceInMs = now.getTime() - this.removedAt!.getTime()
                const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

                if (differenceInMs < sevenDaysInMs) {
                    throw new Error("User has been removed from the house.")
                }

                this.props.status = ResidentStatus.ACTIVE
                this.props.removeStatus = null
                this.props.rejoinedCount++
                this.markAsUpdated()
                return
            }

        }

        if (this.hasLeft()) {
            this.props.status = ResidentStatus.ACTIVE
            this.props.rejoinedCount++
            this.markAsUpdated()
            return
        }

        throw new Error("User is in an invalid state to rejoin.")
    }

    makeOwner(): void {
        if (this.isOwner()) {
            throw new Error("Resident is already an owner.")
        }

        if (!this.isActive()) {
            throw new Error("Resident must be in the house to become an owner.")
        }

        this.props.role = ResidentRole.OWNER
        this.markAsUpdated()
    }

    makeMember(): void {
        if (this.isMember()) {
            throw new Error("Resident is already a member.")
        }

        if (!this.isActive()) {
            throw new Error("Resident must be in the house to become a member.")
        }

        this.props.role = ResidentRole.MEMBER
        this.markAsUpdated()
    }
}