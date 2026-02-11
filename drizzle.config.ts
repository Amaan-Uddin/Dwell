import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: "./src/db/schema",
    out: "./src/db/migrations",
    driver: "pglite",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true
})