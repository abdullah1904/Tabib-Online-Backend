import { integer, pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { AccountStatus } from "../utils/constants";

export const DoctorTable = pgTable("doctors", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    imageURL: varchar({ length: 255 }),
    fullName: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    gender: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    address: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 255 }).notNull().unique(),
    pmdcRedgNo: varchar({ length: 255 }).notNull(),
    pmdcRedgDate: timestamp().notNull(),
    medicalDegree: integer().notNull(),
    postGraduateDegree: integer().notNull(),
    specialization: integer().notNull(),
    yearsOfExperience: integer().notNull(),
    pmdcLicenseDocumentURL: varchar({ length: 255 }).notNull(),
    verificationDocumentType: integer().notNull(),
    verificationDocumentNumber: varchar({ length: 255 }).notNull().unique(),
    verificationDocumentURL: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    authenticInformationConsent: boolean().notNull(),
    licenseVerificationConsent: boolean().notNull(),
    termsAgreementConsent: boolean().notNull(),
    dataUsageConsentConsent: boolean().notNull(),
    status: integer().notNull().default(AccountStatus.PENDING),
    verifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})