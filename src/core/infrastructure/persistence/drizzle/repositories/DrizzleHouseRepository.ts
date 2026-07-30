import { House, HouseStatus } from "@/core/domain/housing/entities/House"
import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"
import { HouseSelectType, house as HouseTb } from "@/db/schema/housing/house"
import { Database } from "@/db"
import { drizzleErrorLogger } from "../utils"
import { eq } from "drizzle-orm"

export class DrizzleHouseRepository implements IHouseRepository {
    constructor(private readonly db: Database) { }

    async save(house: House): Promise<House> {
        const db_row = this.toPersistence(house)
        try {
            const [row] = await this.db.insert(HouseTb).values(db_row).onConflictDoUpdate({
                target: HouseTb.id,
                set: { ...db_row, createdAt: undefined }
            }).returning()
            return this.toDomain(row)
        } catch (error) {
            drizzleErrorLogger(error, { operation: "save", house: house })
            throw new Error("Failed to save house data to db.", { cause: error })
        }
    }

    async findById(id: string): Promise<House | null> {
        if (!id.trim()) throw new Error("Cannot find house without an ID.")
        try {
            const [row] = await this.db.select().from(HouseTb).where(eq(HouseTb.id, id))
            return row ? this.toDomain(row) : null
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findById", id: id })
            throw new Error(`Failed to fetch house with ID=${id}.`, { cause: error })
        }
    }

    async findByOwner(ownerId: string): Promise<House[]> {
        if (!ownerId.trim()) throw new Error("Cannot find house without ownerId.")
        try {
            const result = await this.db.select().from(HouseTb).where(eq(HouseTb.ownedBy, ownerId))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByOwner", ownerId: ownerId })
            throw new Error(`Failed to fetch houses owned by ID=${ownerId}`, { cause: error })
        }
    }

    async findByStatus(status: HouseStatus): Promise<House[]> {
        if (!status.trim()) throw new Error("Cannot find house without a valid status.")
        try {
            const result = await this.db.select().from(HouseTb).where(eq(HouseTb.status, status))
            return result.map((row) => this.toDomain(row))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findByStatus", status: status })
            throw new Error(`Failed to fetch houses with status=${status}`, { cause: error })
        }
    }

    async findHouseCount(ownerId: string): Promise<number> {
        if (!ownerId.trim()) throw new Error("Cannot count number of houses without ownerId.")
        try {
            return await this.db.$count(HouseTb, eq(HouseTb.ownedBy, ownerId))
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findUserHouseCount", ownerId: ownerId })
            throw new Error(`Failed to fetch count of houses owner with ID=${ownerId}`, { cause: error })
        }
    }

    async findHouseCountForUpdate(ownerId: string): Promise<number> {
        if (!ownerId.trim()) throw new Error("Cannot count number of houses without ownerId.")
        try {
            // This tells Postgres: "lock every row this SELECT touches, until the current transaction commits or rolls back."
            const rows = await this.db.select({ id: HouseTb.id }).from(HouseTb).where(eq(HouseTb.ownedBy, ownerId)).for("update")
            return rows.length
        } catch (error) {
            drizzleErrorLogger(error, { operation: "findUserHouseCount", ownerId: ownerId })
            throw new Error(`Failed to fetch count of houses owner with ID=${ownerId}`, { cause: error })
        }
    }

    private toDomain(db_house: HouseSelectType): House {
        if (!Object.values(HouseStatus).includes(db_house.status as HouseStatus)) {
            throw new Error(`Database corruption detected: Invalid house status ${db_house.status}`)
        }
        return House.reconstitute({
            id: db_house.id,
            name: db_house.name,
            description: db_house.description,
            status: db_house.status as HouseStatus,
            ownedBy: db_house.ownedBy,
            createdAt: db_house.createdAt,
            updatedAt: db_house.updatedAt,
            abandonedAt: db_house.abandonedAt,
            archivedAt: db_house.archivedAt
        })
    }

    private toPersistence(house: House): HouseSelectType {
        const houseObj = house.toObject()
        return {
            id: houseObj.id,
            name: houseObj.name,
            description: houseObj.description,
            status: houseObj.status,
            ownedBy: houseObj.ownedBy,
            createdAt: houseObj.createdAt,
            updatedAt: houseObj.updatedAt,
            abandonedAt: houseObj.abandonedAt,
            archivedAt: houseObj.archivedAt
        }
    }
} 