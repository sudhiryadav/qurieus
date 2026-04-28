import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/lib/s3";
import { logger } from "@/lib/logger";
import { qdrant, getQdrantConfig } from "@/lib/qdrant";

// Function to delete vectors from Qdrant
async function deleteVectorsForDocument(userId: string, qdrantDocumentId: string) {
  try {
    const config = getQdrantConfig();
    
    logger.info("deleteVectorsForDocument: Starting deletion", {
      userId,
      qdrantDocumentId,
      QDRANT_URL: config.QDRANT_URL ? 'SET' : 'NOT_SET',
      QDRANT_COLLECTION: config.QDRANT_COLLECTION ? 'SET' : 'NOT_SET',
      QDRANT_API_KEY: config.QDRANT_API_KEY ? 'SET' : 'NOT_SET'
    });

    if (!config.QDRANT_COLLECTION) {
      throw new Error("QDRANT_COLLECTION is not set");
    }
    if (!config.QDRANT_URL) {
      throw new Error("QDRANT_URL is not set");
    }
    if (!config.QDRANT_API_KEY) {
      throw new Error("QDRANT_API_KEY is not set");
    }
    
    // First, let's check what vectors exist in the collection
    try {
      const info = await qdrant.getCollection(config.QDRANT_COLLECTION);
      logger.info("deleteVectorsForDocument: Collection info", {
        collection: config.QDRANT_COLLECTION,
        vectorCount: info.indexed_vectors_count,
        pointsCount: info.points_count
      });
    } catch (infoError) {
    }
    
    const filter = {
      must: [
        { key: "user_id", match: { value: userId } },
        { key: "document_id", match: { value: qdrantDocumentId } },
      ],
    };

    logger.info("deleteVectorsForDocument: Calling Qdrant delete", {
      collection: config.QDRANT_COLLECTION,
      filter
    });
    
    await qdrant.delete(config.QDRANT_COLLECTION, { filter });
    
  } catch (error) {
    throw error;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Debug: Log environment variables at the start
    const config = getQdrantConfig();
    
    logger.info("Document Delete API: Environment check", {
      QDRANT_URL: config.QDRANT_URL ? 'SET' : 'NOT_SET',
      QDRANT_COLLECTION: config.QDRANT_COLLECTION ? 'SET' : 'NOT_SET',
      QDRANT_API_KEY: config.QDRANT_API_KEY ? 'SET' : 'NOT_SET'
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin (can delete any document) or regular user (can only delete own documents)
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    logger.info("Document Delete API: Processing delete request", { 
      userId: session.user.id,
      documentId: id
    });

    // Find the document - admin can delete any document, user can only delete own documents
    const document = await prisma.document.findUnique({
      where: {
        id,
        ...(isAdmin ? {} : { userId: session.user.id }), // Only filter by userId if not admin
      },
    });

    if (!document) {
      logger.warn("Document Delete API: Document not found or access denied", {
        userId: session.user.id,
        documentId: id,
        isAdmin,
        userRole: session.user.role
      });
      return NextResponse.json(
        { error: isAdmin ? "Document not found" : "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Log document details for debugging
    logger.info("Document Delete API: Document found", {
      userId: session.user.id,
      documentId: id,
      isAdmin,
      userRole: session.user.role,
      documentOwnerId: document.userId,
      documentFields: {
        id: document.id,
        qdrantDocumentId: document.qdrantDocumentId,
        aiDocumentId: document.aiDocumentId,
        status: document.status,
        isProcessed: document.isProcessed
      }
    });

    // Check for DocumentChunk records that might have Qdrant vectors
    const documentChunks = await prisma.documentChunk.findMany({
      where: { documentId: id },
      select: { qdrantPointId: true }
    });

    // Delete from Qdrant if we have any document id used for vectors (processed docs or processing/stuck)
    const qdrantIdToDelete = document.qdrantDocumentId ?? document.aiDocumentId ?? null;
    const hasQdrantVectors = qdrantIdToDelete ||
                             document.isProcessed ||
                             document.status === 'PROCESSED' ||
                             documentChunks.some(chunk => chunk.qdrantPointId);

    logger.info("Document Delete API: Qdrant deletion check", {
      userId: session.user.id,
      documentId: id,
      isAdmin,
      userRole: session.user.role,
      qdrantDocumentId: document.qdrantDocumentId,
      aiDocumentId: document.aiDocumentId,
      isProcessed: document.isProcessed,
      status: document.status,
      documentChunksCount: documentChunks.length,
      hasQdrantPointIds: documentChunks.some(chunk => chunk.qdrantPointId),
      shouldDeleteFromQdrant: hasQdrantVectors,
      qdrantIdToDelete,
    });

    if (hasQdrantVectors && qdrantIdToDelete) {
      try {
        await deleteVectorsForDocument(document.userId, qdrantIdToDelete);
        logger.info("Document Delete API: Document deleted from Qdrant", {
          userId: session.user.id,
          documentId: id,
          qdrantIdToDelete,
          isProcessed: document.isProcessed,
          status: document.status,
          chunksDeleted: documentChunks.length,
        });
      } catch (qdrantError: unknown) {
        const errorMessage = qdrantError instanceof Error ? qdrantError.message : String(qdrantError);
        logger.warn("Document Delete API: Failed to delete from Qdrant", {
          userId: session.user.id,
          documentId: id,
          qdrantIdToDelete,
          error: errorMessage,
        });
        // Continue with deletion even if Qdrant deletion fails
      }
    } else {
      logger.info("Document Delete API: Skipping Qdrant deletion - no document id for vectors", {
        userId: session.user.id,
        documentId: id,
        qdrantDocumentId: document.qdrantDocumentId,
        aiDocumentId: document.aiDocumentId,
        isProcessed: document.isProcessed,
        status: document.status,
        chunksCount: documentChunks.length,
      });
    }

    // Delete from S3 if fileName exists
    if (document.fileName) {
      try {
        await s3Service.deleteDocument(document.fileName);
        
        logger.info("Document Delete API: Document deleted from S3", {
          userId: session.user.id,
          documentId: id,
          fileName: document.fileName
        });
      } catch (s3Error: any) {
        const errorMessage = s3Error instanceof Error ? s3Error.message : String(s3Error);
        logger.warn("Document Delete API: Failed to delete from S3", {
          userId: session.user.id,
          documentId: id,
          fileName: document.fileName,
          error: errorMessage
        });
        // Continue with deletion even if S3 deletion fails
      }
    }

    // Delete from database (this will cascade to related records)
    await prisma.document.delete({
      where: { id },
    });

    logger.info("Document Delete API: Document deleted from database", {
      userId: session.user.id,
      documentId: id,
      isAdmin,
      userRole: session.user.role,
      documentOwnerId: document.userId
    });

    return NextResponse.json({
      message: "Document deleted successfully",
      deletedDocument: {
        id: document.id,
        title: document.title,
        originalName: document.originalName,
        ownerId: document.userId
      },
      deletedBy: {
        userId: session.user.id,
        role: session.user.role,
        isAdmin
      }
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Document Delete API: Unexpected error", {
      error: errorMessage,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
