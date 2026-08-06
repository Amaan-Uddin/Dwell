import { Database, db } from "@/db"

import { IUnitOfWork } from "@/core/domain/shared/IUnitOfWork"
import { ITransactionContext } from "@/core/domain/shared/ITransactionContext"

import { IHouseRepository } from "@/core/domain/housing/repositories/IHouseRepository"

import { DrizzleHouseRepository } from "./DrizzleHouseRepository"
import { DrizzleResidentRepository } from "./DrizzleResidentRepository"
import { IResidentRepository } from "@/core/domain/housing/repositories/IResidentRepository"
import { DrizzleUserRepository } from "./DrizzleUserRepository"
import { IUserRepository } from "@/core/domain/auth/repositories/IUserRepository"

class DrizzleTransactionContext implements ITransactionContext {

    private _houseRepo?: IHouseRepository
    private _residentRepo?: IResidentRepository
    private _userRepo?: IUserRepository

    constructor(private tx: Database) { }

    get houseRepo() {
        return this._houseRepo ??= new DrizzleHouseRepository(this.tx)
    }

    get residentRepo() {
        return this._residentRepo ??= new DrizzleResidentRepository(this.tx)
    }

    get userRepo() {
        return this._userRepo ??= new DrizzleUserRepository(this.tx)
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