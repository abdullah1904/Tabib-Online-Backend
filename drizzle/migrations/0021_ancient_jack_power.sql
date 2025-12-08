ALTER TABLE "doctor_appointments" RENAME COLUMN "medicalNotes" TO "additionalNotes";--> statement-breakpoint
ALTER TABLE "doctor_appointments" ADD COLUMN "service" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_appointments" ADD COLUMN "healthInfoSharingConsent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_service_doctor_services_id_fk" FOREIGN KEY ("service") REFERENCES "public"."doctor_services"("id") ON DELETE cascade ON UPDATE no action;