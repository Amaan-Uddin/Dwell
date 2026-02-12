import { integer } from "drizzle-orm/pg-core"
import { timestamps } from "@/db/utils/columns.helpers"
import { user, profileSchema } from "./user"
import { house } from "../space/house"

export const rolesEnum = profileSchema.enum("roles", ["ADMIN", "HOUSE-MASTER", "TENANT", "GUEST"])

export const resident = profileSchema.table("residents", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().references(() => user.id, { onDelete: "cascade" }).notNull(),
    role: rolesEnum().default("GUEST").notNull(),
    houseId: integer().references(() => house.id),
    ...timestamps
})