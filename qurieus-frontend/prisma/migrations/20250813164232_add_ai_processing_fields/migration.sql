-- CreateEnum
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('Pending', 'Processing', 'Processed', 'Failed');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "aiChunks" INTEGER,
ADD COLUMN     "aiDocumentId" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "processingStatus" "DocumentProcessingStatus" NOT NULL DEFAULT 'Pending',
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Document_processingStatus_idx" ON "Document"("processingStatus");

-- CreateIndex
CREATE INDEX "Document_aiDocumentId_idx" ON "Document"("aiDocumentId");
