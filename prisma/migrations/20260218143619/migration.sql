/*
  Warnings:

  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfessionalInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalInfo" DROP CONSTRAINT "ProfessionalInfo_userId_fkey";

-- DropTable
DROP TABLE "MedicalRecord";

-- DropTable
DROP TABLE "ProfessionalInfo";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verificationDocumentType" INTEGER NOT NULL,
    "verificationDocumentNumber" TEXT NOT NULL,
    "verificationDocumentURL" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "prefix" TEXT NOT NULL,
    "suspendedTill" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecords" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactNumber" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "allergies" TEXT NOT NULL,
    "currentMedications" TEXT NOT NULL,
    "familyMedicalHistory" TEXT NOT NULL,
    "pastMedicalHistory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalInfos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medicalDegree" INTEGER NOT NULL,
    "postGraduateDegree" INTEGER NOT NULL,
    "specialization" INTEGER NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "PMDCRedgNo" TEXT NOT NULL,
    "PMDCRedgDate" TIMESTAMP(3) NOT NULL,
    "PMDCLicenseDocumentURL" TEXT NOT NULL,
    "PMDCVerficationStatus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalInfos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecords_userId_key" ON "MedicalRecords"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalInfos_userId_key" ON "ProfessionalInfos"("userId");

-- AddForeignKey
ALTER TABLE "MedicalRecords" ADD CONSTRAINT "MedicalRecords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalInfos" ADD CONSTRAINT "ProfessionalInfos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
