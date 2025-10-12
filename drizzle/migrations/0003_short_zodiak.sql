ALTER TABLE "verifications" ADD COLUMN "userType" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "verificationType" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "activatedAt";