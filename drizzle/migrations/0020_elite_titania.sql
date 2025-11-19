CREATE TABLE "doctor_appointments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "doctor_appointments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user" integer NOT NULL,
	"doctor" integer NOT NULL,
	"appointmentDate" date NOT NULL,
	"appointmentTime" time NOT NULL,
	"medicalNotes" varchar(500),
	"status" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_doctor_doctors_id_fk" FOREIGN KEY ("doctor") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;