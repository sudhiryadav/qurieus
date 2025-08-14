/*
  Warnings:

  - You are about to drop the column `aiChunks` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `processingStatus` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Document_processingStatus_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "aiChunks",
DROP COLUMN "processingStatus",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "DocumentProcessingStatus";

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");
