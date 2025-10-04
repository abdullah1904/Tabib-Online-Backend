CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"imageURL" varchar(255),
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"privilegeLevel" integer NOT NULL,
	"recoveryEmail" varchar(255),
	"password" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email"),
	CONSTRAINT "admins_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"bloodType" varchar(3) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"allergies" varchar(500) NOT NULL,
	"currentMedications" varchar(500) NOT NULL,
	"familyMedicalHistory" varchar(500) NOT NULL,
	"pastMedicalHistory" varchar(500) NOT NULL,
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
	"gender" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"phoneNumber" varchar(255) NOT NULL,
	"emergencyContactNumber" varchar(255) NOT NULL,
	"emergencyContactName" varchar(255) NOT NULL,
	"verificationDocumentType" integer NOT NULL,
	"verificationDocumentNumber" varchar(255) NOT NULL,
	"verificationDocumentURL" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"treatmentConsent" boolean NOT NULL,
	"healthInfoDisclosureConsent" boolean NOT NULL,
	"privacyPolicyConsent" boolean NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
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