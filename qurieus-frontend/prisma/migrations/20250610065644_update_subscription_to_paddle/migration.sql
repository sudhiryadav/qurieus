/*
  Warnings:

  - You are about to drop the column `lastPaymentAmount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentError` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paddleSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paddleCustomerId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paddleSubscriptionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Subscription_razorpaySubscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "lastPaymentAmount",
DROP COLUMN "lastPaymentDate",
DROP COLUMN "lastPaymentError",
DROP COLUMN "lastPaymentId",
DROP COLUMN "razorpayCustomerId",
DROP COLUMN "razorpaySubscriptionId",
ADD COLUMN     "paddleCustomerId" TEXT NOT NULL,
ADD COLUMN     "paddlePaymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paddlePaymentDate" TIMESTAMP(3),
ADD COLUMN     "paddlePaymentError" TEXT,
ADD COLUMN     "paddlePaymentId" TEXT,
ADD COLUMN     "paddleSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paddleSubscriptionId_key" ON "Subscription"("paddleSubscriptionId");
