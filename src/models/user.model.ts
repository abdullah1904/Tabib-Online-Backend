import { 
    pgTable, 
    integer, 
    varchar, 
    pgEnum,
    timestamp,
    boolean
} from "drizzle-orm/pg-core";
import { AccountStatus, Gender, UserVerificationDocumentType } from "../utils/constants";

const genderValues = Object.values(Gender) as [Gender,...Gender[]];
export const genderEnum = pgEnum("gender", genderValues);

const verificationDocumentTypeValues = Object.values(UserVerificationDocumentType) as [UserVerificationDocumentType,...UserVerificationDocumentType[]];
export const verificationDocumentTypeEnum = pgEnum("verification_document_type", verificationDocumentTypeValues);

const accountStatusValues = Object.values(AccountStatus) as [AccountStatus,...AccountStatus[]];
export const accountStatusEnum = pgEnum("user_status", accountStatusValues);

export const UserTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullName: varchar({ length: 100 }).notNull(),
    age: integer().notNull(),
    gender: genderEnum().notNull(),
    email: varchar({ length: 100 }).notNull().unique(),
    address: varchar({ length: 200 }).notNull(),
    phoneNumber: varchar({ length: 14 }).notNull().unique(),
    emergencyContactNumber: varchar({ length: 100 }).notNull(),
    emergencyContactName: varchar({ length: 14 }).notNull(),
    verificationDocumentType: verificationDocumentTypeEnum().notNull(),
    verificationDocumentNumber: varchar({ length: 25 }).notNull().unique(),
    verificationDocumentURL: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    treatmentConsent: boolean().notNull(),
    healthInfoDisclosureConsent: boolean().notNull(),
    privacyPolicyConsent: boolean().notNull(),
    status: accountStatusEnum().notNull().default(AccountStatus.PENDING),
    activatedAt: timestamp({ withTimezone: true }),
    verifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});
