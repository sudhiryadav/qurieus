/*
  Warnings:

  - You are about to drop the column `modalDocumentId` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "modalDocumentId",
ADD COLUMN     "chunkCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "qdrantDocumentId" TEXT;

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "qdrantPointId" TEXT,
    "embeddingVector" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChunk_chunkIndex_idx" ON "DocumentChunk"("chunkIndex");

-- CreateIndex
CREATE INDEX "DocumentChunk_qdrantPointId_idx" ON "DocumentChunk"("qdrantPointId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "Document_qdrantDocumentId_idx" ON "Document"("qdrantDocumentId");

-- CreateIndex
CREATE INDEX "Document_isProcessed_idx" ON "Document"("isProcessed");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
