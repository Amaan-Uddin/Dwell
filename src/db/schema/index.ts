import { pgSchema } from "drizzle-orm/pg-core"

export const authSchema = pgSchema("auth")
export const housingSchema = pgSchema("housing")
export const assetSchema = pgSchema("asset")
export const systemSchema = pgSchema("system")