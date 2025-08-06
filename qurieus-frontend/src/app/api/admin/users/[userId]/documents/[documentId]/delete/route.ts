import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Initialize Qdrant client with API key if available
const qdrant = new QdrantClient({ 
  url: QDRANT_URL, 
  checkCompatibility: false,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

async function deleteVectorsFromQdrant(userId: string, docId: string) {
  try {
    logger.info(`Admin Delete API: Attempting to delete vectors for document ${docId} from Qdrant`);
    
    // Check if collection exists first
    try {
      if (!QDRANT_COLLECTION) {
        throw new Error("QDRANT_COLLECTION is not set");
      }
      if (!QDRANT_URL) {
        throw new Error("QDRANT_URL is not set");
      }
      if (!QDRANT_API_KEY) {
        throw new Error("QDRANT_API_KEY is not set");
      }

      const collectionInfo = await qdrant.getCollection(QDRANT_COLLECTION);
      logger.info(`Admin Delete API: Collection exists with ${collectionInfo.points_count} points`);
    } catch (collectionError) {
      logger.info(`Admin Delete API: Collection ${QDRANT_COLLECTION} does not exist or is not accessible`);
      // If collection doesn't exist, there's nothing to delete
      return;
    }
    
    await qdrant.delete(QDRANT_COLLECTION, {
      filter: {
        must: [
          { key: "user_id", match: { value: userId } },
          { key: "doc_id", match: { value: docId } },
        ],
      },
    });
    logger.info(`Admin Delete API: Successfully deleted vectors for document ${docId} from Qdrant`);
  } catch (error) {
    logger.error(`Admin Delete API: Error deleting vectors from Qdrant for document ${docId}:`, error);
    // Don't throw error, continue with database deletion
  }
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(async (
  request: NextRequest,
  context: { params: Promise<{ userId: string; documentId: string }> }
) => {
  try {
    const session = await getServerSession(authOptions);
    const { userId, documentId } = await context.params;

    logger.info("Admin Delete API: Deleting document for user", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      documentId 
    });

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      logger.warn("Admin Delete API: Target user not found", { targetUserId: userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // First check if the document exists and belongs to the target user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
      },
    });

    if (!existingDocument) {
      logger.warn("Admin Delete API: Document not found or doesn't belong to user", { 
        documentId, 
        targetUserId: userId 
      });
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete vectors from Qdrant first
    await deleteVectorsFromQdrant(userId, documentId);

    // Delete the document from database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    logger.info("Admin Delete API: Document deleted successfully", { 
      adminId: session!.user!.id,
      targetUserId: userId,
      documentId 
    });

    return NextResponse.json({ 
      success: true,
      message: "Document deleted successfully" 
    });
  } catch (error: any) {
    logger.error("Admin Delete API: Error deleting document", { 
      error: error.message,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}); 