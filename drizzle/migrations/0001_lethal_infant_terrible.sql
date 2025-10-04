CREATE TABLE "verifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verifications_email_unique" UNIQUE("email")
);
