/*
  Warnings:

  - You are about to drop the column `pendingAmount` on the `Appointments` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Appointments` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointments" DROP COLUMN "pendingAmount",
DROP COLUMN "totalAmount",
ADD COLUMN     "totalPrice" INTEGER NOT NULL;
