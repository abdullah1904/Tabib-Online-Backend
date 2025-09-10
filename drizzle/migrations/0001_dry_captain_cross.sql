ALTER TABLE "medical_records" ALTER COLUMN "allergies" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "currentMedications" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "familyMedicalHistory" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "medical_records" ALTER COLUMN "pastMedicalHistory" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "fullName" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "address" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET DATA TYPE varchar(14);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "emergencyContactNumber" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "emergencyContactName" SET DATA TYPE varchar(14);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verificationDocumentNumber" SET DATA TYPE varchar(25);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verificationDocumentURL" SET DATA TYPE varchar(255);