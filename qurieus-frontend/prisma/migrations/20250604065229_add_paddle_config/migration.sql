/*
  Warnings:

  - The values [basic,pro,enterprise] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.
  - The values [monthly,quarterly,yearly] on the enum `SubscriptionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('FREE', 'BASIC', 'STANDARD', 'PRO', 'ENTERPRISE');
ALTER TABLE "Users" ALTER COLUMN "plan" TYPE "PlanType_new" USING ("plan"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "PlanType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionType_new" AS ENUM ('TRIAL', 'MONTHLY', 'YEARLY');
ALTER TABLE "Users" ALTER COLUMN "subscription_type" TYPE "SubscriptionType_new" USING ("subscription_type"::text::"SubscriptionType_new");
ALTER TYPE "SubscriptionType" RENAME TO "SubscriptionType_old";
ALTER TYPE "SubscriptionType_new" RENAME TO "SubscriptionType";
DROP TYPE "SubscriptionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "PaddleConfig" (
    "id" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaddleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaddleConfig_subscriptionPlanId_key" ON "PaddleConfig"("subscriptionPlanId");

-- AddForeignKey
ALTER TABLE "PaddleConfig" ADD CONSTRAINT "PaddleConfig_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
