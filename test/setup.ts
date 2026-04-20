import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { randomUUID } from "crypto"

export async function createTestDb() {
    // generate a schema name for our test db
    const schema = `test_${randomUUID().slice(0, 8)}`

    const pool = new Pool({
        connectionString: process.env.TEST_DB_URL
    })
    // create a test schema in our test db
    await pool.query(`create schema if not exist ${schema}`)
    // tell postgres to search for tables and db objects in schema by setting a search path(s)
    await pool.query(`set search_path to ${schema}`)

    // create a drizzle db client using postgres connection pool 
    const db = drizzle(pool)
    // apply all migrations to test db
    await migrate(db, { migrationsFolder: "../src/db/migrations" })

    // return drizzle client instance and a cleanup function to drop schema and all its tables and db objects
    return {
        db,
        cleanup: async () => {
            await pool.query(`drop schema ${schema} cascade`)
            await pool.end()
        }
    }
}