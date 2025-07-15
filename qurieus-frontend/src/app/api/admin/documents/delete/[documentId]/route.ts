import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const qdrant = new QdrantClient({ url: QDRANT_URL, checkCompatibility: false ,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

async function deleteVectorsFromQdrant(userId: string, docId: string) {
  try {
    console.log(`Attempting to delete vectors for document ${docId} from Qdrant`);
    
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
      console.log(`Collection exists with ${collectionInfo.points_count} points`);
    } catch (collectionError) {
      console.log(`Collection ${QDRANT_COLLECTION} does not exist or is not accessible`);
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
    console.log(`Successfully deleted vectors for document ${docId} from Qdrant`);
  } catch (error) {
    console.error(`Error deleting vectors from Qdrant for document ${docId}:`, error);
    // Don't throw error, just log it and continue with database deletion
    console.log(`Continuing with database deletion despite Qdrant error`);
  }
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(
  async (request: NextRequest, user?: any) => {
  // Extract documentId from the URL path
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const documentId = pathParts[pathParts.length - 1]; // Get the last part of the path
  try {
    // Get user session
    const session = await getServerSession(authOptions);
      const userId = session!.user!.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Delete vectors from Qdrant
    await deleteVectorsFromQdrant(userId, documentId);
    
    // Delete from database
    const deletedDocument = await prisma.document.deleteMany({
      where: {
        id: documentId,
        userId: userId, // Ensure user owns the document
      },
    });

    if (deletedDocument.count === 0) {
      return NextResponse.json(
        { error: 'Document not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const result = {
      success: true,
      message: `Document ${documentId} deleted successfully`,
      documents_remaining: await prisma.document.count({ where: { userId } }),
    };

    return NextResponse.json({
      success: true,
      message: result.message,
      documents_remaining: result.documents_remaining,
    });

  } catch (error) {
    console.error('Error in delete:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the document' },
      { status: 500 }
    );
  }
} 
); 