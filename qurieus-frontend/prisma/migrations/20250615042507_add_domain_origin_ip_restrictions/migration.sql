-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "allowedIPs" TEXT[],
ADD COLUMN     "allowedOrigins" TEXT[],
ADD COLUMN     "allowedReferrers" TEXT[];
