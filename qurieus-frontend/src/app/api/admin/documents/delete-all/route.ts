import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import axiosInstance from '@/lib/axios';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_COLLECTION = "user_documents_embeddings"; // Fixed collection name
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Initialize Qdrant client with API key if available
const qdrant = new QdrantClient({ 
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

async function deleteAllVectorsForUser(userId: string) {
  try {
    await qdrant.delete(QDRANT_COLLECTION, {
      filter: {
        must: [
          { key: "user_id", match: { value: userId } },
        ],
      },
    });
    console.log(`Deleted all vectors for user ${userId} from Qdrant`);
  } catch (error) {
    console.error(`Error deleting vectors from Qdrant for user ${userId}:`, error);
    throw error;
  }
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(async (request: NextRequest) => {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id;

    // Delete all vectors from Qdrant
    await deleteAllVectorsForUser(userId);
    
    // Delete all documents from database
    const deletedCount = await prisma.document.count({
      where: { userId },
    });
    
    await prisma.document.deleteMany({
      where: { userId },
    });

    const result = {
      success: true,
      message: `All documents for user ${userId} deleted successfully`,
      documents_deleted: deletedCount,
    };

    return NextResponse.json({
      success: true,
      message: result.message,
      documents_deleted: result.documents_deleted,
    });

  } catch (error) {
    console.error('Error in delete-all:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting all documents' },
      { status: 500 }
    );
  }
}); 