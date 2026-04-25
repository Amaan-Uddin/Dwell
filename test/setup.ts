import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import * as schema from "@/db/schema"
import { beforeAll, afterAll } from "vitest"

const pool = new Pool({
    connectionString: process.env.TEST_DB_URL
})
export const db = drizzle({ client: pool, schema: schema })

beforeAll(async () => {
    await migrate(db, { migrationsFolder: "./src/db/migrations" })
})

afterAll(async () => {
    await pool.end()
})
