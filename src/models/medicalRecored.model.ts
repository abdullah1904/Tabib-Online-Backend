import {
    pgTable,
    varchar,
    numeric,
    integer,
    timestamp
} from "drizzle-orm/pg-core";
import { UserTable } from "./user.model";

export const MedicalRecordTable = pgTable("medical_records", {
    bloodType: varchar({ length: 3 }).notNull(),
    height: numeric({ precision: 5, scale: 2 }).notNull(),
    weight: numeric({ precision: 5, scale: 2 }).notNull(),
    allergies: varchar({ length: 500 }).notNull(),
    currentMedications: varchar({ length: 500 }).notNull(),
    familyMedicalHistory: varchar({ length: 500 }).notNull(),
    pastMedicalHistory: varchar({ length: 500 }).notNull(),
    user: integer().references(() => UserTable.id, { onDelete: 'cascade' }).notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});