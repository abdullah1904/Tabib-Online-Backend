import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { AccountStatus } from "../utils/constants";

export const AdminTable = pgTable("admins", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    imageURL: varchar({ length: 255 }),
    fullName: varchar({ length: 255 }).notNull(), 
    email: varchar({ length: 255 }).notNull().unique(),
    phone: varchar({ length: 255 }).notNull().unique(),
    privilegeLevel: integer().notNull(), 
    recoveryEmail: varchar({ length: 255 }),
    password: varchar({ length: 255 }).notNull(),
    status: integer().notNull().default(AccountStatus.ACTIVE),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});