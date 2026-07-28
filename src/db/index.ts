import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from "./schema"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
})

export const db = drizzle({ client: pool, casing: "snake_case", schema: schema })

/**  
 * NOTE: Typed as NodePgDatabase<typeof schema> instead of `typeof db`.
 * `typeof db` includes `$client` (the pool reference), which a transaction object (`tx` from db.transaction(...)) does NOT have — only query methods.
 * Repositories need to accept either `db` or `tx` interchangeably (for the Unit of Work pattern), so this type only describes what both share.
 * Do NOT change this back to `typeof db` — it will break passing `tx` into repository constructors.
 */
export type Database = NodePgDatabase<typeof schema>