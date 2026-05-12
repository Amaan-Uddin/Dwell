import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import * as schema from "@/db/schema"

const pool = new Pool({
    connectionString: process.env.TEST_DB_URL
})
export const db = drizzle({ client: pool, schema: schema })

export async function setup() {
    await migrate(db, { migrationsFolder: "./src/db/migrations" })
}

export async function teardown() {
    await pool.end()
}