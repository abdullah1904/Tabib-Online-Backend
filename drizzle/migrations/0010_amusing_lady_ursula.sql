ALTER TABLE "doctor_reviews" ALTER COLUMN "comment" SET DATA TYPE varchar(500);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_review_idx" ON "doctor_reviews" USING btree ("user","doctor");