/*
  Warnings:

  - You are about to drop the column `prefix` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProfessionalInfos" ADD COLUMN     "prefix" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "prefix";
