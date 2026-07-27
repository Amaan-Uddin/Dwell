import { Resident, ResidentStatus, RemoveStatus } from "@/core/domain/housing/entities/Resident"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"
import { Database } from "@/db"
import { ResidentSelectType, resident as ResidentTb } from "@/db/schema/housing/resident"
import { drizzleErrorLogger } from "../utils"
import { and, eq } from "drizzle-orm"

export class DrizzleResidentRepository implements IResidentRepository {
    constructor(private readonly db: Database) { }

    async save(resident: Resident): Promise<Resident> {
        const db_row = this.toPersistence(resident)
        try {
            const row = await this.db.insert(ResidentTb).values(db_row).onConflictDoUpdate({
                target: ResidentTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(row[0])
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save" })
            throw new Error("Failed to save resident data to db.", { cause: error })
        }
    }

    async findById(id: string): Promise<Resident | null> {
        try {
            if (!id.trim()) throw new Error("Cannot find resident without ID.")
            const result = await this.db.select().from(ResidentTb).where(eq(ResidentTb.id, id)).limit(1)
            return result[0] ? this.toDomain(result[0]) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById" })
            throw new Error(`Failed to fetch resident by ID=${id}`, { cause: error })
        }
    }

    async findByUserId(userId: string): Promise<Resident[]> {
        try {
            if (!userId.trim()) throw new Error("Cannot find residents without user ID.")
            const result = await this.db.select().from(ResidentTb).where(eq(ResidentTb.userId, userId))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByUserId" })
            throw new Error(`Failed to fetch residents by user ID=${userId}`, { cause: error })
        }
    }

    async findByHouseId(houseId: string): Promise<Resident[]> {
        try {
            if (!houseId.trim()) throw new Error("Cannot find residents without house ID.")
            const result = await this.db.select().from(ResidentTb).where(eq(ResidentTb.houseId, houseId))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByHouseId" })
            throw new Error(`Failed to fetch residents by house ID=${houseId}`, { cause: error })
        }
    }

    async findByUserAndHouseId(userId: string, houseId: string): Promise<Resident | null> {
        try {
            if (!userId.trim()) throw new Error("Cannot find resident without user ID.")
            if (!houseId.trim()) throw new Error("Cannot find resident without house ID.")
            const result = await this.db.select().from(ResidentTb).where(and(eq(ResidentTb.userId, userId), eq(ResidentTb.houseId, houseId))).limit(1)
            return result[0] ? this.toDomain(result[0]) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByUserAndHouseId" })
            throw new Error(`Failed to fetch resident by user ID=${userId} and house ID=${houseId}`, { cause: error })
        }
    }

    toDomain(db_resident: ResidentSelectType): Resident {
        if (!Object.values(ResidentStatus).includes(db_resident.status as ResidentStatus)) {
            throw new Error(`Database corruption detected: Invalid resident status ${db_resident.status}`)
        }

        if (db_resident.removeStatus && !Object.values(RemoveStatus).includes(db_resident.removeStatus as RemoveStatus)) {
            throw new Error(`Database corruption detected: Invalid resident remove status ${db_resident.removeStatus}`)
        }

        return Resident.reconstitute({
            id: db_resident.id,
            userId: db_resident.userId,
            houseId: db_resident.houseId,
            status: db_resident.status as ResidentStatus,
            removeStatus: db_resident.removeStatus as RemoveStatus | null,
            rejoinedCount: db_resident.rejoinedCount,
            createdAt: db_resident.createdAt,
            updatedAt: db_resident.updatedAt,
            leftAt: db_resident.leftAt,
            removedAt: db_resident.removedAt
        })
    }

    toPersistence(resident: Resident): ResidentSelectType {
        const residentObj = resident.toObject()
        return {
            id: residentObj.id,
            userId: residentObj.userId,
            houseId: residentObj.houseId,
            status: residentObj.status,
            removeStatus: residentObj.removeStatus,
            rejoinedCount: residentObj.rejoinedCount,
            createdAt: residentObj.createdAt,
            updatedAt: residentObj.updatedAt,
            leftAt: residentObj.leftAt,
            removedAt: residentObj.removedAt
        }
    }
}