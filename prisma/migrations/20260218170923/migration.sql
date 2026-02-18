/*
  Warnings:

  - Added the required column `phoneNumber` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "phoneNumber" TEXT NOT NULL;
