ALTER TABLE "doctor_verification_applications" ADD COLUMN "reviewedBy" integer;--> statement-breakpoint
ALTER TABLE "doctor_verification_applications" ADD COLUMN "results" varchar(1000);