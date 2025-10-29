import { pgTable, integer, timestamp, varchar, time, boolean } from "drizzle-orm/pg-core";
import { DoctorTable } from "./doctor.model";
import { relations } from "drizzle-orm";
import z from "zod";

export const DoctorServiceTable = pgTable("doctor_services", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 100 }).notNull(),
    type: integer().notNull(),
    price: integer().notNull(),
    duration: integer().notNull(),
    time: time().notNull(),
    location: varchar({ length: 200 }),
    allowCustom: boolean().notNull().default(false),
    doctor: integer().references(() => DoctorTable.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const DoctorServiceAvailabilityTable = pgTable("doctor_service_availability", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    service: integer().references(() => DoctorServiceTable.id, { onDelete: 'cascade' }).notNull(),
    dayOfWeek: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const DoctorServiceTableRelations = relations(DoctorServiceTable, ({ one, many }) => ({
    doctor: one(DoctorTable, {
        fields: [DoctorServiceTable.doctor],
        references: [DoctorTable.id],
    }),
    availableDays: many(DoctorServiceAvailabilityTable),
}));

export const DoctorServiceAvailabilityTableRelations = relations(DoctorServiceAvailabilityTable, ({ one }) => ({
    service: one(DoctorServiceTable, {
        fields: [DoctorServiceAvailabilityTable.service],
        references: [DoctorServiceTable.id],
    }),
}));