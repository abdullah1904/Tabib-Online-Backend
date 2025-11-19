import { pgTable, integer, time, date, varchar, timestamp } from "drizzle-orm/pg-core";
import { UserTable } from "./user.model";
import { DoctorTable } from "./doctor.model";
import { AppointmentStatus } from "../utils/constants";

export const DoctorAppointmentTable = pgTable("doctor_appointments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user: integer().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
    doctor: integer().references(() => DoctorTable.id, { onDelete: 'cascade' }).notNull(),
    appointmentDate: date().notNull(),
    appointmentTime: time().notNull(),
    medicalNotes: varchar({ length: 500 }),
    status: integer().notNull().default(AppointmentStatus.PENDING),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});