import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";
import qdrant, { getQdrantConfig } from "@/lib/qdrant";

async function deleteVectorsFromQdrant(userId: string, docId: string) {
  try {
    const config = getQdrantConfig();
    
    // Check if collection exists first
    try {
      if (!config.QDRANT_COLLECTION) {
        throw new Error("QDRANT_COLLECTION is not set");
      }
      if (!config.QDRANT_URL) {
        throw new Error("QDRANT_URL is not set");
      }
        if (!config.QDRANT_API_KEY) {
        throw new Error("QDRANT_API_KEY is not set");
      }

      const collectionInfo = await qdrant.getCollection(config.QDRANT_COLLECTION);
    } catch (collectionError) {
      // If collection doesn't exist, there's nothing to delete
      return;
    }
    
    await qdrant.delete(config.QDRANT_COLLECTION, {
      filter: {
        must: [
          { key: "user_id", match: { value: userId } },
          { key: "document_id", match: { value: docId } }, // Fixed: use document_id instead of doc_id
        ],
      },
    });
  } catch (error) {
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