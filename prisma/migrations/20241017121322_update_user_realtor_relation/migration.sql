/*
  Warnings:

  - You are about to drop the column `createdById` on the `Realtor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Realtor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Realtor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Realtor" DROP CONSTRAINT "Realtor_createdById_fkey";

-- AlterTable
ALTER TABLE "Realtor" DROP COLUMN "createdById",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Realtor_userId_key" ON "Realtor"("userId");

-- AddForeignKey
ALTER TABLE "Realtor" ADD CONSTRAINT "Realtor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
