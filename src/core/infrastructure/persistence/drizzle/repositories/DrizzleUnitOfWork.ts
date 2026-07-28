import { Database, db } from "@/db"

import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { ITransactionContext } from "@/core/domain/shared/ITransactionContext"

import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"

import { DrizzleHouseRepository } from "./DrizzleHouseRepository"
import { DrizzleResidentRepository } from "./DrizzleResidentRepository"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"

class DrizzleTransactionContext implements ITransactionContext {

    private _houseRepo?: IHouseRepository
    private _residentRepo?: IResidentRepository

    constructor(private tx: Database) { }

    get houseRepo() {
        return this._houseRepo ??= new DrizzleHouseRepository(this.tx)
    }

    get residentRepo() {
        return this._residentRepo ??= new DrizzleResidentRepository(this.tx)
    }
}

export class DrizzleUnitOfWork implements IUnitOfWork {
    async execute<T>(work: (ctx: ITransactionContext) => Promise<T>): Promise<T> {
        return db.transaction(async (tx) => {
            const ctx = new DrizzleTransactionContext(tx)
            return work(ctx)
        })
    }
}