import { UserTable } from "./user.model";
import { DoctorTable } from "./doctor.model";
import { relations } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const DoctorReviewTable = pgTable("doctor_reviews", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user: integer().references(() => UserTable.id, { onDelete: 'cascade' }).notNull().unique(),
    doctor: integer().references(() => DoctorTable.id, { onDelete: 'cascade' }).notNull(),
    ratings: integer().notNull(),
    comment: varchar({ length: 500 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
}, (table) => ({
    uniqueReview: uniqueIndex("unique_review_idx").on(
        table.user,
        table.doctor
    ),
}));

export const DoctorReviewTableRelations = relations(DoctorReviewTable, ({ one }) => ({
    user: one(UserTable, {
        fields: [DoctorReviewTable.user],
        references: [UserTable.id],
    }),
    doctor: one(DoctorTable, {
        fields: [DoctorReviewTable.doctor],
        references: [DoctorTable.id],
    }),
}));
