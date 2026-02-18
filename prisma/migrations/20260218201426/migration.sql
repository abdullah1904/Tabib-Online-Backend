-- DropForeignKey
ALTER TABLE "MedicalRecords" DROP CONSTRAINT "MedicalRecords_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalInfos" DROP CONSTRAINT "ProfessionalInfos_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verifications" DROP CONSTRAINT "Verifications_userId_fkey";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "imageURL" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Verifications" ADD CONSTRAINT "Verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecords" ADD CONSTRAINT "MedicalRecords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalInfos" ADD CONSTRAINT "ProfessionalInfos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
