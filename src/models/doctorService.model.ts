import { pgTable, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { DoctorTable } from "./doctor.model";
import { relations } from "drizzle-orm";

export const DoctorServiceTable = pgTable("doctor_services", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 1000 }).notNull(),
    type: integer().notNull(),
    price: integer().notNull(),
    duration: integer().notNull(),
    availability: timestamp({ withTimezone: true }).notNull(),
    location: varchar({ length: 200 }),
    doctor: integer().references(() => DoctorTable.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const DoctorServiceTableRelations = relations(DoctorServiceTable, ({ one }) => ({
    doctor: one(DoctorTable, {
        fields: [DoctorServiceTable.doctor],
        references: [DoctorTable.id],
    }),
}));