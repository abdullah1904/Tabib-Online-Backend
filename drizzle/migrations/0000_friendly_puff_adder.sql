CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."verification_document_type" AS ENUM('nationalIDCard', 'passport', 'otherGovtId');--> statement-breakpoint
CREATE TABLE "medical_records" (
	"bloodType" varchar(3) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"allergies" varchar(1000) NOT NULL,
	"currentMedications" varchar(1000) NOT NULL,
	"familyMedicalHistory" varchar(2000) NOT NULL,
	"pastMedicalHistory" varchar(2000) NOT NULL,
	"user" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_records_user_unique" UNIQUE("user")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fullName" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"phoneNumber" varchar(20) NOT NULL,
	"emergencyContactNumber" varchar(20) NOT NULL,
	"emergencyContactName" varchar(255) NOT NULL,
	"verificationDocumentType" "verification_document_type" NOT NULL,
	"verificationDocumentNumber" varchar(100) NOT NULL,
	"verificationDocumentURL" varchar(1000) NOT NULL,
	"password" varchar(255) NOT NULL,
	"treatmentConsent" boolean NOT NULL,
	"healthInfoDisclosureConsent" boolean NOT NULL,
	"privacyPolicyConsent" boolean NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"activatedAt" timestamp with time zone,
	"verifiedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phoneNumber_unique" UNIQUE("phoneNumber"),
	CONSTRAINT "users_verificationDocumentNumber_unique" UNIQUE("verificationDocumentNumber")
);
--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;