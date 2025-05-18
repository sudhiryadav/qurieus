/*
  Warnings:

  - You are about to drop the column `city` on the `ChatConversation` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `ChatConversation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChatConversation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatConversation` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `ChatMessage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[visitorId,userId]` on the table `ChatConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatConversation" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "responseTime";

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_visitorId_userId_key" ON "ChatConversation"("visitorId", "userId");
