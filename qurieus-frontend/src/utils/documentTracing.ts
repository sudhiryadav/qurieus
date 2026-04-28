import { prisma } from './prismaDB';

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload: {
    document_id: string;
    user_id: string;
    content: string;
    filename: string;
    chunk_index: number;
  };
}

export interface TracedDocumentResult {
  documentId: string;
  documentTitle: string;
  fileName: string;
  chunkIndex: number;
  chunkContent: string;
  score: number;
  sourceUrl?: string;
  uploadedAt: Date;
}

/**
 * Trace Qdrant search results back to source documents
 * This helps identify which document and chunk each search result came from
 */
export async function traceQdrantResults(
  qdrantResults: QdrantSearchResult[],
  userId: string
): Promise<TracedDocumentResult[]> {
  const tracedResults: TracedDocumentResult[] = [];

  for (const result of qdrantResults) {
    try {
      // Find the document by Qdrant document ID
      const document = await prisma.document.findFirst({
        where: {
          qdrantDocumentId: result.payload.document_id,
          userId: userId,
        },
        select: {
          id: true,
          title: true,
          fileName: true,
          originalName: true,
          uploadedAt: true,
          chunks: {
            where: {
              chunkIndex: result.payload.chunk_index,
            },
            select: {
              id: true,
              chunkIndex: true,
              content: true,
            },
          },
        },
      });

      if (document && document.chunks.length > 0) {
        const chunk = document.chunks[0];
        tracedResults.push({
          documentId: document.id,
          documentTitle: document.title,
          fileName: document.originalName,
          chunkIndex: chunk.chunkIndex,
          chunkContent: chunk.content,
          score: result.score,
          uploadedAt: document.uploadedAt,
        });
      } else {
        // Fallback: use data from Qdrant payload
        tracedResults.push({
          documentId: result.payload.document_id,
          documentTitle: result.payload.filename,
          fileName: result.payload.filename,
          chunkIndex: result.payload.chunk_index,
          chunkContent: result.payload.content,
          score: result.score,
          uploadedAt: new Date(), // We don't have this info from Qdrant
        });
      }
    } catch (error) {
      // Continue with other results
    }
  }

  return tracedResults;
}

/**
 * Get document and chunk information by Qdrant point ID
 */
export async function getDocumentByQdrantPointId(
  qdrantPointId: string,
  userId: string
): Promise<TracedDocumentResult | null> {
  try {
    const chunk = await prisma.documentChunk.findFirst({
      where: {
        qdrantPointId: qdrantPointId,
        document: {
          userId: userId,
        },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            originalName: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!chunk) {
      return null;
    }

    return {
      documentId: chunk.document.id,
      documentTitle: chunk.document.title,
      fileName: chunk.document.originalName,
      chunkIndex: chunk.chunkIndex,
      chunkContent: chunk.content,
      score: 1.0, // We don't have score info when querying by ID
      uploadedAt: chunk.document.uploadedAt,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get all chunks for a specific document
 */
export async function getDocumentChunks(
  documentId: string,
  userId: string
): Promise<Array<{
  chunkIndex: number;
  content: string;
  qdrantPointId: string | null;
}>> {
  try {
    const chunks = await prisma.documentChunk.findMany({
      where: {
        documentId: documentId,
        document: {
          userId: userId,
        },
      },
      select: {
        chunkIndex: true,
        content: true,
        qdrantPointId: true,
      },
      orderBy: {
        chunkIndex: 'asc',
      },
    });

    return chunks;
  } catch (error) {
    return [];
  }
}

/**
 * Get document statistics including chunk count and processing status
 */
export async function getDocumentStats(
  documentId: string,
  userId: string
): Promise<{
  totalChunks: number;
  isProcessed: boolean;
  processedAt: Date | null;
  qdrantDocumentId: string | null;
} | null> {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
      select: {
        chunkCount: true,
        isProcessed: true,
        processedAt: true,
        qdrantDocumentId: true,
      },
    });

    if (!document) {
      return null;
    }

    return {
      totalChunks: document.chunkCount,
      isProcessed: document.isProcessed,
      processedAt: document.processedAt,
      qdrantDocumentId: document.qdrantDocumentId,
    };
  } catch (error) {
    return null;
  }
} 