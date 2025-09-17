import { 
    pgTable, 
    integer, 
    varchar, 
    pgEnum,
    timestamp,
    boolean
} from "drizzle-orm/pg-core";
import { AccountStatus, Gender, UserVerificationDocumentType } from "../utils/constants";

export const UserTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullName: varchar({ length: 256 }).notNull(),
    age: integer().notNull(),
    gender: integer().notNull(),
    email: varchar({ length: 256 }).notNull().unique(),
    address: varchar({ length: 256 }).notNull(),
    phoneNumber: varchar({ length: 256 }).notNull().unique(),
    emergencyContactNumber: varchar({ length: 256 }).notNull(),
    emergencyContactName: varchar({ length: 256 }).notNull(),
    verificationDocumentType: integer().notNull(),
    verificationDocumentNumber: varchar({ length: 256 }).notNull().unique(),
    verificationDocumentURL: varchar({ length: 256 }).notNull(),
    password: varchar({ length: 256 }).notNull(),
    treatmentConsent: boolean().notNull(),
    healthInfoDisclosureConsent: boolean().notNull(),
    privacyPolicyConsent: boolean().notNull(),
    status: integer().notNull().default(AccountStatus.PENDING),
    activatedAt: timestamp({ withTimezone: true }),
    verifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});
