/*
  Warnings:

  - Added the required column `createdById` to the `Realtor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Realtor" ADD COLUMN     "createdById" TEXT NOT NULL;
