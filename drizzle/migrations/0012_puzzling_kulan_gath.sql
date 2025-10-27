ALTER TABLE "doctor_services" RENAME COLUMN "availability" TO "time";--> statement-breakpoint
ALTER TABLE "doctor_services" ADD COLUMN "availableDays" json NOT NULL;