/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,userId]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pendingAmount` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointments" ADD COLUMN     "pendingAmount" INTEGER NOT NULL,
ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_doctorId_userId_key" ON "Reviews"("doctorId", "userId");
