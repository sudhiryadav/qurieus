-- DropIndex
DROP INDEX "UserSubscription_userId_key";

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "planSnapshot" JSONB;
