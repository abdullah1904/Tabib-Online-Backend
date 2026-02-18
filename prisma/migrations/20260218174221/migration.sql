/*
  Warnings:

  - The `prefix` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "prefix",
ADD COLUMN     "prefix" INTEGER NOT NULL DEFAULT 0;
