/*
  Warnings:

  - You are about to drop the column `contractSent` on the `Realtor` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_realtorId_fkey";

-- AlterTable
ALTER TABLE "LeadAssignment" ADD COLUMN     "comments" TEXT;

-- AlterTable
ALTER TABLE "Realtor" DROP COLUMN "contractSent";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Notification";
