-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Testimonial_status_idx" ON "Testimonial"("status");
