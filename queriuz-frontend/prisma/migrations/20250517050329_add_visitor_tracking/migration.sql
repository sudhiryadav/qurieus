/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `conversationId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- DropIndex
DROP INDEX "ChatMessage_createdAt_idx";

-- DropIndex
DROP INDEX "ChatMessage_keywords_idx";

-- DropIndex
DROP INDEX "ChatMessage_userId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "ipAddress",
DROP COLUMN "keywords",
DROP COLUMN "userId",
ADD COLUMN     "conversationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "referrer" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
