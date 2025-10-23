CREATE TABLE "doctor_reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "doctor_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user" integer NOT NULL,
	"doctor" integer NOT NULL,
	"ratings" integer NOT NULL,
	"comment" varchar(1000) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doctor_reviews_user_unique" UNIQUE("user")
);
--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "medical_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "doctor_reviews" ADD CONSTRAINT "doctor_reviews_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_reviews" ADD CONSTRAINT "doctor_reviews_doctor_doctors_id_fk" FOREIGN KEY ("doctor") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;