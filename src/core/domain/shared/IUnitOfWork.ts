import { ITransactionContext } from "./ITransactionContext";

export interface IUnitOfWork {
    // execute will take a function `work` as its argument
    // `work` will run inside of a db transaction
    // ctx is a bag of repositories which we can use inside the transaction
    execute<T>(work: (ctx: ITransactionContext) => Promise<T>): Promise<T>
}