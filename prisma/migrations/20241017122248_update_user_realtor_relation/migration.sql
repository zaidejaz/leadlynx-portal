/*
  Warnings:

  - You are about to drop the column `userId` on the `Realtor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Realtor" DROP CONSTRAINT "Realtor_userId_fkey";

-- DropIndex
DROP INDEX "Realtor_userId_key";

-- AlterTable
ALTER TABLE "Realtor" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Realtor" ADD CONSTRAINT "Realtor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
