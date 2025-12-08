import { pgTable, integer, time, date, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { UserTable } from "./user.model";
import { DoctorTable } from "./doctor.model";
import { AppointmentStatus } from "../utils/constants";
import { DoctorServiceTable } from "./doctorService.model";

export const DoctorAppointmentTable = pgTable("doctor_appointments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user: integer().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
    doctor: integer().references(() => DoctorTable.id, { onDelete: 'cascade' }).notNull(),
    service: integer().references(() => DoctorServiceTable.id, { onDelete: 'cascade' }).notNull(),
    appointmentDate: date().notNull(),
    appointmentTime: time().notNull(),
    additionalNotes: varchar({ length: 500 }),
    healthInfoSharingConsent: boolean().notNull().default(false),
    status: integer().notNull().default(AppointmentStatus.PENDING),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});