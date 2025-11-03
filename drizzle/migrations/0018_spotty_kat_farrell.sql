ALTER TABLE "doctor_verification_applications" RENAME COLUMN "doctorId" TO "doctor";--> statement-breakpoint
ALTER TABLE "doctor_verification_applications" DROP CONSTRAINT "doctor_verification_applications_doctorId_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "suspendedTill" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "doctor_verification_applications" ADD CONSTRAINT "doctor_verification_applications_doctor_doctors_id_fk" FOREIGN KEY ("doctor") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;