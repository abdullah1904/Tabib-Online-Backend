import { 
    pgTable, 
    integer, 
    varchar, 
    timestamp,
    boolean
} from "drizzle-orm/pg-core";
import { AccountStatus, } from "../utils/constants";

export const UserTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    imageURL: varchar({ length: 255 }),
    fullName: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    gender: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    address: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 255 }).notNull().unique(),
    emergencyContactNumber: varchar({ length: 255 }).notNull(),
    emergencyContactName: varchar({ length: 255 }).notNull(),
    verificationDocumentType: integer().notNull(),
    verificationDocumentNumber: varchar({ length: 255 }).notNull().unique(),
    verificationDocumentURL: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    treatmentConsent: boolean().notNull(),
    healthInfoDisclosureConsent: boolean().notNull(),
    privacyPolicyConsent: boolean().notNull(),
    status: integer().notNull().default(AccountStatus.PENDING),
    verifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});
