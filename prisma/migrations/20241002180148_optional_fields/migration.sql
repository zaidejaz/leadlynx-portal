/*
  Warnings:

  - You are about to alter the column `bathrooms` on the `Lead` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "bathrooms" SET DATA TYPE INTEGER;
