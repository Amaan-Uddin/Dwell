import { Resident, ResidentStatus, RemoveStatus, ResidentRole } from "@/core/domain/housing/entities/Resident"
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
            const [row] = await this.db.insert(ResidentTb).values(db_row).onConflictDoUpdate({
                target: ResidentTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save" })
            throw new Error("Failed to save resident data to db.", { cause: error })
        }
    }

    async findById(id: string): Promise<Resident | null> {
        if (!id.trim()) throw new Error("Cannot find resident without ID.")
        try {
            const [row] = await this.db.select().from(ResidentTb).where(eq(ResidentTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById" })
            throw new Error(`Failed to fetch resident by ID=${id}`, { cause: error })
        }
    }

    async findByUserId(userId: string): Promise<Resident[]> {
        if (!userId.trim()) throw new Error("Cannot find residents without user ID.")
        try {
            const result = await this.db.select().from(ResidentTb).where(eq(ResidentTb.userId, userId))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByUserId" })
            throw new Error(`Failed to fetch residents by user ID=${userId}`, { cause: error })
        }
    }

    async findByHouseId(houseId: string): Promise<Resident[]> {
        if (!houseId.trim()) throw new Error("Cannot find residents without house ID.")
        try {
            const result = await this.db.select().from(ResidentTb).where(eq(ResidentTb.houseId, houseId))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByHouseId" })
            throw new Error(`Failed to fetch residents by house ID=${houseId}`, { cause: error })
        }
    }

    async findByUserAndHouseId(userId: string, houseId: string): Promise<Resident | null> {
        if (!userId.trim()) throw new Error("Cannot find resident without user ID.")
        if (!houseId.trim()) throw new Error("Cannot find resident without house ID.")
        try {
            const [row] = await this.db.select().from(ResidentTb).where(and(eq(ResidentTb.userId, userId), eq(ResidentTb.houseId, houseId)))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByUserAndHouseId" })
            throw new Error(`Failed to fetch resident by user ID=${userId} and house ID=${houseId}`, { cause: error })
        }
    }

    async findByUserAndHouseIdForUpdate(userId: string, houseId: string): Promise<Resident | null> {
        if (!userId.trim()) throw new Error("Cannot find resident without user ID.")
        if (!houseId.trim()) throw new Error("Cannot find resident without house ID.")
        try {
            const [row] = await this.db.select().from(ResidentTb).where(and(eq(ResidentTb.userId, userId), eq(ResidentTb.houseId, houseId))).for("update")
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByUserAndHouseId" })
            throw new Error(`Failed to fetch resident by user ID=${userId} and house ID=${houseId}`, { cause: error })
        }
    }

    async findResidentCountForUpdate(houseId: string): Promise<number> {
        if (!houseId.trim()) throw new Error("Cannot count residents in house without houseId")
        try {
            const rows = await this.db.select({ id: ResidentTb.id }).from(ResidentTb).where(and(eq(ResidentTb.houseId, houseId), eq(ResidentTb.status, ResidentStatus.ACTIVE))).for("update")
            return rows.length
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findResidentCount" })
            throw new Error(`Failed to fetch resident count for house ID=${houseId}`, { cause: error })
        }
    }

    toDomain(db_resident: ResidentSelectType): Resident {
        if (!Object.values(ResidentStatus).includes(db_resident.status as ResidentStatus)) {
            throw new Error(`Database corruption detected: Invalid resident status ${db_resident.status}`)
        }
        if (db_resident.removeStatus && !Object.values(RemoveStatus).includes(db_resident.removeStatus as RemoveStatus)) {
            throw new Error(`Database corruption detected: Invalid resident remove status ${db_resident.removeStatus}`)
        }
        if (!Object.values(ResidentRole).includes(db_resident.role as ResidentRole)) {
            throw new Error(`Database corruption detected: Invalid resident role ${db_resident.role}`)
        }
        return Resident.reconstitute({
            id: db_resident.id,
            userId: db_resident.userId,
            houseId: db_resident.houseId,
            status: db_resident.status as ResidentStatus,
            role: db_resident.role as ResidentRole,
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
            role: residentObj.role,
            removeStatus: residentObj.removeStatus,
            rejoinedCount: residentObj.rejoinedCount,
            createdAt: residentObj.createdAt,
            updatedAt: residentObj.updatedAt,
            leftAt: residentObj.leftAt,
            removedAt: residentObj.removedAt
        }
    }
}