/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Appointments` table. All the data in the column will be lost.
  - You are about to drop the `ServiceAvailabilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Services` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `consultationId` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointments" DROP CONSTRAINT "Appointments_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAvailabilities" DROP CONSTRAINT "ServiceAvailabilities_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Services" DROP CONSTRAINT "Services_doctorId_fkey";

-- DropIndex
DROP INDEX "Appointments_serviceId_idx";

-- AlterTable
ALTER TABLE "Appointments" DROP COLUMN "serviceId",
ADD COLUMN     "consultationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProfessionalInfos" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPMDCEditable" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "ServiceAvailabilities";

-- DropTable
DROP TABLE "Services";

-- CreateTable
CREATE TABLE "Consultations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "allowCustom" BOOLEAN NOT NULL DEFAULT false,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSlots" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationSlots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointments_consultationId_idx" ON "Appointments"("consultationId");

-- AddForeignKey
ALTER TABLE "Consultations" ADD CONSTRAINT "Consultations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSlots" ADD CONSTRAINT "ConsultationSlots_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
