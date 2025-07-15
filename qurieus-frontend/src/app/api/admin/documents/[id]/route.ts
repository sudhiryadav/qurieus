import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Initialize Qdrant client with API key if available
const qdrant = new QdrantClient({ url: QDRANT_URL, checkCompatibility: false ,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

async function deleteVectorsForDocument(userId: string, documentId: string) {
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
    await qdrant.delete(QDRANT_COLLECTION, {
      filter: {
        must: [
          { key: "user_id", match: { value: userId } },
          { key: "document_id", match: { value: documentId } },
        ],
      },
    });
    console.log(`Deleted vectors for document ${documentId} from Qdrant`);
  } catch (error) {
    console.error(`Error deleting vectors from Qdrant for document ${documentId}:`, error);
    throw error;
  }
}

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  console.log("DELETE request for document ID:", id);

  const session = await getServerSession(authOptions);

  try {
    // First check if the document exists and belongs to the user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
          userId: session!.user!.id,
      },
    });

    if (!existingDocument) {
        console.log("Document not found or doesn't belong to user:", { id, userId: session!.user!.id });
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete vectors from Qdrant first
    await deleteVectorsForDocument(session!.user!.id, id);

    // Delete the document from database
    await prisma.document.delete({
      where: {
        id,
      },
    });

    console.log("Document deleted successfully:", id);
    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 
); 