import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "user_embeddings";
const qdrant = new QdrantClient({ url: QDRANT_URL });

async function deleteVectorsFromQdrant(userId: string, docId: string) {
  await qdrant.delete(QDRANT_COLLECTION, {
    filter: {
      must: [
        { key: "user_id", match: { value: userId } },
        { key: "doc_id", match: { value: docId } },
      ],
    },
  });
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(
  async (request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) => {
  const { documentId } = await params;
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