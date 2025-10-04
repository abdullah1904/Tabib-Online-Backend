import { pgTable, integer, varchar, timestamp} from "drizzle-orm/pg-core";

export const VerificationTable = pgTable("verifications", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 255 }).notNull().unique(),
    otp: varchar({ length: 6 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})