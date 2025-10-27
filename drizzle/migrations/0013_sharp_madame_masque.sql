CREATE TABLE "doctor_service_availability" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "doctor_service_availability_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"service" integer NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doctor_service_availability" ADD CONSTRAINT "doctor_service_availability_service_doctor_services_id_fk" FOREIGN KEY ("service") REFERENCES "public"."doctor_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_services" DROP COLUMN "availableDays";