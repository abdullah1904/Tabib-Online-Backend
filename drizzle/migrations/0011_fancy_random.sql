CREATE TABLE "doctor_services" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "doctor_services_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(100) NOT NULL,
	"description" varchar(1000) NOT NULL,
	"type" integer NOT NULL,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"availability" timestamp with time zone NOT NULL,
	"location" varchar(200),
	"doctor" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doctor_services" ADD CONSTRAINT "doctor_services_doctor_doctors_id_fk" FOREIGN KEY ("doctor") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;