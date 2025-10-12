import { uniqueIndex } from "drizzle-orm/pg-core";
import { pgTable, integer, varchar, timestamp} from "drizzle-orm/pg-core";

export const VerificationTable = pgTable("verifications", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 255 }).notNull(),
    otp: varchar({ length: 6 }).notNull(),
    userType: integer().notNull(),
    verificationType: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => ({
    uniqueVerification: uniqueIndex("unique_verification_idx").on(
        table.email,
        table.verificationType,
        table.userType
    ),
}));