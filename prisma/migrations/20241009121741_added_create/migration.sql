/*
  Warnings:

  - Added the required column `createdById` to the `Realtor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Realtor" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "zipCodes" TEXT[];

-- AddForeignKey
ALTER TABLE "Realtor" ADD CONSTRAINT "Realtor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
