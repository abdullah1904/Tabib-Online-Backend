/*
  Warnings:

  - A unique constraint covering the columns `[email,verificationDocumentNumber,verificationDocumentType,phoneNumber]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_verificationDocumentNumber_verificationDocument_key" ON "Users"("email", "verificationDocumentNumber", "verificationDocumentType", "phoneNumber");
